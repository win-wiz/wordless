import type { Client } from "@libsql/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { applyVisitorSessionCookie, getPlayerFromRequest } from "@/server/auth";
import { ensureAuthTablesReady } from "@/server/auth-bootstrap";
import { saveStrandsScore } from "@/server/strands-puzzles";
import { createTursoClient } from "@/server/turso";

export const runtime = "edge";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const payloadSchema = z.object({
  date: z.string().regex(DATE_PATTERN).optional(),
  puzzleId: z.string().trim().min(1),
  anonymousId: z.string().trim().min(1).optional(),
  hintsUsed: z.number().int().min(0),
  completed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const client = createTursoClient() as Client;

  try {
    const payload = payloadSchema.parse(await request.json());

    await ensureAuthTablesReady();
    const player = await getPlayerFromRequest(client, request, {
      createVisitorIfMissing: true,
    });

    const date = payload.date ?? new Date().toISOString().slice(0, 10);

    // userId 只取自服务端会话，客户端 body 无法伪造身份
    await saveStrandsScore(client, {
      date,
      puzzleId: payload.puzzleId,
      userId: player.user?.id ?? null,
      anonymousId: payload.anonymousId ?? null,
      hintsUsed: payload.hintsUsed,
      completed: payload.completed ?? true,
    });

    return applyVisitorSessionCookie(
      NextResponse.json({ success: true }),
      player,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "The Strands score payload is invalid." },
        { status: 400 },
      );
    }

    console.error("save strands score error:", error);

    return NextResponse.json(
      { error: "Couldn't save your Strands score. Please try again." },
      { status: 500 },
    );
  } finally {
    client.close();
  }
}
