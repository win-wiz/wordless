import { NextResponse } from "next/server";

import { createTursoClient } from "@/server/turso";
import { assertValidWafflePayload, getRandomWafflePuzzle } from "@/server/waffle-puzzles";

export const runtime = "nodejs";

export async function GET() {
  const client = createTursoClient();

  try {
    const puzzle = await getRandomWafflePuzzle(client);

    if (!puzzle) {
      return NextResponse.json(
        { error: "Waffle unlimited mode is currently unavailable." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ...assertValidWafflePayload(puzzle),
      date: null,
      mode: "unlimited",
      sequence: null,
      status: null,
      timezone: "UTC",
      version: null,
    });
  } finally {
    client.close();
  }
}
