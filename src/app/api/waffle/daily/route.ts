import { NextResponse, type NextRequest } from "next/server";

import { createTursoClient } from "@/server/turso";
import {
  assertValidWafflePayload,
  getWaffleDailyPuzzle,
  getWaffleDailyScheduleRange,
  getWaffleDateKey,
  WAFFLE_DAILY_SCHEDULE_VERSION,
  WAFFLE_DAILY_TIMEZONE,
} from "@/server/waffle-puzzles";

export const runtime = "edge";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const requestedDate = request.nextUrl.searchParams.get("date");
  const hasExplicitDate = Boolean(requestedDate && DATE_PATTERN.test(requestedDate));
  const dateKey = hasExplicitDate ? requestedDate! : getWaffleDateKey();
  const client = createTursoClient();

  try {
    const puzzle = await getWaffleDailyPuzzle(client, dateKey, WAFFLE_DAILY_SCHEDULE_VERSION);

    if (!puzzle) {
      const range = await getWaffleDailyScheduleRange(client, WAFFLE_DAILY_SCHEDULE_VERSION);

      return NextResponse.json(
        {
          availableRange: range,
          date: dateKey,
          error: hasExplicitDate
            ? "Waffle daily challenge is not available for that date."
            : "Waffle daily challenge is currently unavailable.",
          version: WAFFLE_DAILY_SCHEDULE_VERSION,
        },
        { status: hasExplicitDate ? 404 : 503 },
      );
    }

    return NextResponse.json({
      ...assertValidWafflePayload(puzzle),
      date: puzzle.date,
      mode: "daily",
      sequence: puzzle.sequence,
      status: puzzle.status,
      timezone: WAFFLE_DAILY_TIMEZONE,
      version: puzzle.version,
    });
  } finally {
    client.close();
  }
}
