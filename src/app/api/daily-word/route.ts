import { NextResponse, type NextRequest } from "next/server";

import {
  getDateKeyForTimezone,
  getDailyScheduleEntry,
  getDailyScheduleRange,
  getDailyScheduleVersion,
  getDailyTimezone,
} from "@/server/daily-schedule";
import { issueDailyChallengeToken } from "@/server/challenge-token";
import { createTursoClient } from "@/server/turso";

export const runtime = "nodejs";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const requestedDate = request.nextUrl.searchParams.get("date");
  const client = createTursoClient();

  try {
    const [dailyScheduleVersion, timezone] = await Promise.all([
      getDailyScheduleVersion(client),
      getDailyTimezone(client),
    ]);
    const hasExplicitDate = Boolean(requestedDate && DATE_PATTERN.test(requestedDate));
    const dateKey =
      hasExplicitDate
        ? requestedDate
        : getDateKeyForTimezone(timezone);
    const dailyEntry = await getDailyScheduleEntry(client, dateKey, dailyScheduleVersion);

    if (!dailyEntry) {
      const range = await getDailyScheduleRange(client, dailyScheduleVersion);
      const status = hasExplicitDate ? 404 : 503;
      const errorMessage =
        range.totalDays > 0
          ? "Daily challenge is not available for this date."
          : "Daily challenge is currently unavailable.";

      return NextResponse.json(
        {
          error: errorMessage,
          date: dateKey,
          availableRange: {
            startDate: range.startDate,
            endDate: range.endDate,
            totalDays: range.totalDays,
          },
          version: dailyScheduleVersion,
        },
        { status },
      );
    }

    return NextResponse.json({
      challengeToken: issueDailyChallengeToken({
        answerWord: dailyEntry.word,
        challengeDate: dailyEntry.date,
        challengeSequence: dailyEntry.sequence,
        challengeVersion: dailyScheduleVersion,
        timezone,
        wordLength: dailyEntry.wordLength,
      }),
      mode: "daily",
      date: dailyEntry.date,
      wordLength: dailyEntry.wordLength,
      difficulty: dailyEntry.difficulty,
      sequence: dailyEntry.sequence,
      timezone,
      version: dailyScheduleVersion,
      replenished: false,
    });
  } finally {
    client.close();
  }
}
