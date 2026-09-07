import type { Client } from "@libsql/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { applyVisitorSessionCookie, getPlayerFromRequest } from "@/server/auth";
import { ensureAuthTablesReady } from "@/server/auth-bootstrap";
import { createTursoClient } from "@/server/turso";
import {
  getWaffleDailyCommunityStats,
  getWaffleDailyRecord,
  getWaffleDailySession,
  getWaffleDailyStats,
  saveWaffleDailyRecord,
  upsertWaffleDailySession,
} from "@/server/waffle-daily-progress";
import {
  getWaffleDailyPuzzle,
  getWaffleDateKey,
  WAFFLE_DAILY_SCHEDULE_VERSION,
} from "@/server/waffle-puzzles";
import {
  countWaffleStars,
  isWaffleSolved,
  WAFFLE_TILE_COUNT,
} from "@/lib/waffle-game";

export const runtime = "nodejs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const payloadSchema = z.object({
  challengeDate: z.string().regex(DATE_PATTERN),
  currentLetters: z.array(z.string().regex(/^[a-z]$/)).length(WAFFLE_TILE_COUNT),
  maxSwaps: z.number().int().min(1).max(30),
  revealed: z.boolean().optional(),
  swapsUsed: z.number().int().min(0).max(500),
  totalTime: z.number().int().min(0).max(60 * 60 * 24),
});

export async function GET(request: NextRequest) {
  const client = createTursoClient() as Client;

  try {
    await ensureAuthTablesReady();
    const player = await getPlayerFromRequest(client, request, {
      createVisitorIfMissing: true,
    });
    const requestedDate = request.nextUrl.searchParams.get("date")?.trim();
    const challengeDate =
      requestedDate && DATE_PATTERN.test(requestedDate)
        ? requestedDate
        : getWaffleDateKey();

    if (!player.user) {
      return NextResponse.json({
        authenticated: false,
        communityStats: null,
        record: null,
        stats: null,
        session: null,
      });
    }

    const [communityStats, record, session, stats] = await Promise.all([
      getWaffleDailyCommunityStats(
        client,
        challengeDate,
        WAFFLE_DAILY_SCHEDULE_VERSION,
      ),
      getWaffleDailyRecord(
        client,
        player.user.id,
        challengeDate,
        WAFFLE_DAILY_SCHEDULE_VERSION,
      ),
      getWaffleDailySession(
        client,
        player.user.id,
        challengeDate,
        WAFFLE_DAILY_SCHEDULE_VERSION,
      ),
      getWaffleDailyStats(
        client,
        player.user.id,
        challengeDate,
        WAFFLE_DAILY_SCHEDULE_VERSION,
      ),
    ]);

    return applyVisitorSessionCookie(
      NextResponse.json({
        authenticated: player.authenticated,
        communityStats,
        record,
        stats,
        session,
      }),
      player,
    );
  } finally {
    client.close();
  }
}

export async function POST(request: NextRequest) {
  const client = createTursoClient() as Client;

  try {
    await ensureAuthTablesReady();
    const player = await getPlayerFromRequest(client, request, {
      createVisitorIfMissing: true,
    });

    if (!player.user) {
      return NextResponse.json(
        {
          authenticated: false,
          communityStats: null,
          error: "Waffle progress is unavailable right now.",
          record: null,
          stats: null,
          session: null,
        },
        { status: 401 },
      );
    }

    const payload = payloadSchema.parse(await request.json());
    const challengeDate = payload.challengeDate;
    const puzzle = await getWaffleDailyPuzzle(
      client,
      challengeDate,
      WAFFLE_DAILY_SCHEDULE_VERSION,
    );

    if (!puzzle) {
      return NextResponse.json(
        { error: "No Waffle daily challenge was found for that date." },
        { status: 404 },
      );
    }

    const currentLetters = payload.currentLetters.map((letter) => letter.toLowerCase());
    const revealed = payload.revealed === true;
    const solved = isWaffleSolved(currentLetters, puzzle.solutionLetters);
    const completed = solved || revealed;
    const isWin = solved && !revealed;

    const session = await upsertWaffleDailySession(client, {
      challengeDate,
      challengeSequence: puzzle.sequence ?? 0,
      challengeVersion: puzzle.version ?? WAFFLE_DAILY_SCHEDULE_VERSION,
      completed,
      currentLetters,
      isWin: completed ? isWin : null,
      maxSwaps: payload.maxSwaps,
      puzzleId: puzzle.id,
      revealed,
      swapsUsed: payload.swapsUsed,
      totalTime: payload.totalTime,
      userId: player.user.id,
    });

    let action: "inserted" | "updated" | "kept" | undefined;
    let record = await getWaffleDailyRecord(
      client,
      player.user.id,
      challengeDate,
      puzzle.version ?? WAFFLE_DAILY_SCHEDULE_VERSION,
    );

    if (completed) {
      const saved = await saveWaffleDailyRecord(client, {
        challengeDate,
        challengeSequence: puzzle.sequence ?? 0,
        challengeVersion: puzzle.version ?? WAFFLE_DAILY_SCHEDULE_VERSION,
        isWin,
        maxSwaps: payload.maxSwaps,
        puzzleId: puzzle.id,
        stars: isWin ? countWaffleStars(payload.swapsUsed, payload.maxSwaps) : 0,
        swapsUsed: payload.swapsUsed,
        totalTime: payload.totalTime,
        userId: player.user.id,
      });
      action = saved.action;
      record = saved.record;
    }

    const [communityStats, stats] = completed
      ? await Promise.all([
        getWaffleDailyCommunityStats(
          client,
          challengeDate,
          puzzle.version ?? WAFFLE_DAILY_SCHEDULE_VERSION,
        ),
        getWaffleDailyStats(
          client,
          player.user.id,
          challengeDate,
          puzzle.version ?? WAFFLE_DAILY_SCHEDULE_VERSION,
        ),
      ])
      : [null, null];

    return applyVisitorSessionCookie(
      NextResponse.json({
        action,
        authenticated: player.authenticated,
        communityStats,
        record,
        stats,
        session,
      }),
      player,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "The Waffle progress payload is invalid." },
        { status: 400 },
      );
    }

    console.error("save waffle progress error:", error);

    return NextResponse.json(
      { error: "Couldn't save your Waffle progress. Please try again." },
      { status: 500 },
    );
  } finally {
    client.close();
  }
}
