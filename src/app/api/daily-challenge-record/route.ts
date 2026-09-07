import type { Client } from "@libsql/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  applyVisitorSessionCookie,
  getPlayerFromRequest,
} from "@/server/auth";
import { verifyDailyChallengeCompletionToken } from "@/server/challenge-token";
import { createTursoClient } from "@/server/turso";
import {
  getDateKeyForTimezone,
  getDailyModeConfig,
} from "@/server/daily-schedule";
import {
  getDailyChallengeCommunityStats,
  getDailyChallengeRecord,
  getDailyChallengeSession,
  getDailyChallengeStats,
  saveDailyChallengeRecord,
} from "@/server/daily-challenge-records";
import { createRequestTimingLogger } from "@/server/request-timing";

export const runtime = "edge";
const MAX_DAILY_ATTEMPTS = 6;

const payloadSchema = z.object({
  completionToken: z.string().trim().min(1).max(2048),
  pattern: z.string().trim().max(128).optional(),
});

export async function GET(request: NextRequest) {
  const client = createTursoClient() as Client;
  const timing = createRequestTimingLogger("/api/daily-challenge-record", {
    method: request.method,
  });
  let responseStatus = 200;

  const respondJson = (
    body: Parameters<typeof NextResponse.json>[0],
    init?: ResponseInit,
  ) => {
    responseStatus = init?.status ?? 200;
    return timing.applyResponseHeaders(NextResponse.json(body, init));
  };

  try {
    let dailyScheduleVersion = request.nextUrl.searchParams.get("version")?.trim();
    let timezone = request.nextUrl.searchParams.get("timezone")?.trim();

    if (!dailyScheduleVersion || !timezone) {
      const dailyModeConfig = await timing.timeStep("load_daily_mode_config", () =>
        getDailyModeConfig(client)
      );
      dailyScheduleVersion = dailyScheduleVersion ?? dailyModeConfig?.scheduleVersion ?? "v1";
      timezone = timezone ?? dailyModeConfig?.timezone ?? "UTC";
    }

      const resolvedDailyScheduleVersion = dailyScheduleVersion ?? "v1";
      const resolvedTimezone = timezone ?? "UTC";

    const player = await timing.timeStep("resolve_player", () =>
      getPlayerFromRequest(client, request)
    );
    const user = player.user;

    const requestedDate = request.nextUrl.searchParams.get("date")?.trim();
      const challengeDate = requestedDate || getDateKeyForTimezone(resolvedTimezone);
    const communityStats = await timing.timeStep("community_stats", () =>
      getDailyChallengeCommunityStats(
        client,
        challengeDate,
          resolvedDailyScheduleVersion,
      )
    );

    const respondWithPlayer = (
      body: Parameters<typeof NextResponse.json>[0],
      init?: ResponseInit,
    ) => applyVisitorSessionCookie(respondJson(body, init), player);

    if (!user) {
      return respondWithPlayer({
        authenticated: false,
        communityStats,
        record: null,
        stats: null,
        session: null,
      });
    }

    const record = await timing.timeStep("load_record", () =>
      getDailyChallengeRecord(
        client,
        user.id,
        challengeDate,
          resolvedDailyScheduleVersion,
      )
    );
    const session = await timing.timeStep("load_session", () =>
      getDailyChallengeSession(
        client,
        user.id,
        challengeDate,
          resolvedDailyScheduleVersion,
      )
    );
    const stats = player.authenticated
      ? await timing.timeStep("load_stats", () =>
        getDailyChallengeStats(
          client,
          user.id,
          challengeDate,
            resolvedDailyScheduleVersion,
            resolvedTimezone,
        )
      )
      : null;

    return respondWithPlayer({
      authenticated: player.authenticated,
      communityStats,
      record,
      stats,
      session,
    });
  } finally {
    timing.log({ status: responseStatus });
    client.close();
  }
}

export async function POST(request: NextRequest) {
  const client = createTursoClient() as Client;
  const timing = createRequestTimingLogger("/api/daily-challenge-record", {
    method: request.method,
  });
  let responseStatus = 200;

  const respondJson = (
    body: Parameters<typeof NextResponse.json>[0],
    init?: ResponseInit,
  ) => {
    responseStatus = init?.status ?? 200;
    return timing.applyResponseHeaders(NextResponse.json(body, init));
  };

  try {
    const payload = await timing.timeStep("parse_payload", async () =>
      payloadSchema.parse(await request.json())
    );
    const completionChallenge = await timing.timeStep("verify_completion_token", () =>
      verifyDailyChallengeCompletionToken(payload.completionToken)
    );
    const resolvedDailyScheduleVersion = completionChallenge.challengeVersion;
    const resolvedTimezone = completionChallenge.timezone;
    const player = await timing.timeStep("resolve_player", () =>
      getPlayerFromRequest(client, request, {
        createVisitorIfMissing: true,
      })
    );
    const user = player.user;

    if (!user) {
      return respondJson(
        {
          authenticated: false,
          record: null,
          session: null,
          error: "Couldn't start a visitor session for this Daily Challenge.",
        },
        { status: 500 },
      );
    }

    const todayChallengeDate = getDateKeyForTimezone(resolvedTimezone);

    if (completionChallenge.challengeDate !== todayChallengeDate) {
      return respondJson(
        {
          error: "Only today's Daily Challenge result can be saved.",
          challengeDate: todayChallengeDate,
        },
        { status: 409 },
      );
    }

    if (completionChallenge.attempts > MAX_DAILY_ATTEMPTS) {
      return respondJson(
        { error: "Attempt count exceeds the allowed Daily Challenge limit." },
        { status: 400 },
      );
    }

    const result = await timing.timeStep("save_record", () =>
      saveDailyChallengeRecord(client, {
        userId: user.id,
        challengeDate: completionChallenge.challengeDate,
        challengeVersion: resolvedDailyScheduleVersion,
        challengeSequence: completionChallenge.challengeSequence,
        answerWord: completionChallenge.answerWord.toUpperCase(),
        wordLength: completionChallenge.wordLength,
        isWin: completionChallenge.isWin,
        attempts: completionChallenge.attempts,
        maxAttempts: MAX_DAILY_ATTEMPTS,
        totalTime: completionChallenge.totalTime,
        pattern: payload.pattern,
      })
    );

    return applyVisitorSessionCookie(respondJson({
      authenticated: player.authenticated,
      action: result.action,
      record: result.record,
      session: null,
    }), player);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respondJson(
        { error: "The Daily Challenge payload is invalid." },
        { status: 400 },
      );
    }

    console.error("save daily challenge record error:", error);

    return respondJson(
      { error: "Couldn't save your Daily Challenge result. Please try again." },
      { status: 500 },
    );
  } finally {
    timing.log({ status: responseStatus });
    client.close();
  }
}
