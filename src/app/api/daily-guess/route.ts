import type { Client } from "@libsql/client";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { evaluateGuess } from "@/lib/game-state";
import { LEXICON_PROFILE_KEYS } from "@/lib/lexicon-profile-keys";
import {
  issueDailyChallengeCompletionToken,
  issueDailyChallengeProgressToken,
  verifyDailyChallengeProgressToken,
  verifyDailyChallengeToken,
} from "@/server/challenge-token";
import {
  getDateKeyForTimezone,
  getDailyModeConfig,
  getDailyScheduleEntry,
} from "@/server/daily-schedule";
import {
  getLexiconProfileEntry,
  resolveDailyGuessEligibility,
} from "@/server/lexicon-profiles";
import { createRequestTimingLogger } from "@/server/request-timing";
import { createTursoClient } from "@/server/turso";

export const runtime = "nodejs";
const MAX_DAILY_ATTEMPTS = 6;

const payloadSchema = z.object({
  challengeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  challengeToken: z.string().trim().min(1).max(2048).optional(),
  challengeVersion: z.string().trim().min(1).max(64).optional(),
  guess: z.string().trim().min(3).max(8),
  progressToken: z.string().trim().min(1).max(2048).optional(),
  totalTime: z.number().int().min(0).max(60 * 60 * 24),
  timezone: z.string().trim().min(1).max(128).optional(),
});

const WORD_PATTERN = /^[a-zA-Z]+$/;

export async function POST(request: NextRequest) {
  const client = createTursoClient() as Client;
  const timing = createRequestTimingLogger("/api/daily-guess", {
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
    const progressChallenge = payload.progressToken
      ? await timing.timeStep("verify_progress_token", () =>
        Promise.resolve(verifyDailyChallengeProgressToken(payload.progressToken!))
      )
      : null;
    const tokenChallenge = payload.challengeToken
      ? await timing.timeStep("verify_challenge_token", () =>
        Promise.resolve(verifyDailyChallengeToken(payload.challengeToken!))
      )
      : null;
    let dailyScheduleVersion =
      payload.challengeVersion ?? tokenChallenge?.challengeVersion;
    let timezone = payload.timezone ?? tokenChallenge?.timezone;

    if (!dailyScheduleVersion || !timezone) {
      const dailyModeConfig = await timing.timeStep("load_daily_mode_config", () =>
        getDailyModeConfig(client)
      );
      dailyScheduleVersion = dailyScheduleVersion ?? dailyModeConfig?.scheduleVersion ?? "v1";
      timezone = timezone ?? dailyModeConfig?.timezone ?? "UTC";
    }

    const resolvedDailyScheduleVersion = dailyScheduleVersion ?? "v1";
    const resolvedTimezone = timezone ?? "UTC";

    const normalizedGuess = payload.guess.trim().toLowerCase();
    const todayChallengeDate = getDateKeyForTimezone(resolvedTimezone);

    if (!WORD_PATTERN.test(normalizedGuess)) {
      return respondJson({
        authenticated: false,
        valid: false,
        guess: normalizedGuess,
        reason: "Word must contain letters only.",
      });
    }

    if (payload.challengeDate !== todayChallengeDate) {
      return respondJson(
        {
          error: "Only today's Daily Challenge can be played.",
          challengeDate: todayChallengeDate,
        },
        { status: 409 },
      );
    }

    if (
      tokenChallenge &&
      (tokenChallenge.challengeDate !== payload.challengeDate ||
        tokenChallenge.challengeVersion !== resolvedDailyScheduleVersion ||
        tokenChallenge.timezone !== resolvedTimezone)
    ) {
      return respondJson(
        { error: "Daily Challenge token does not match the requested puzzle." },
        { status: 409 },
      );
    }

    if (
      progressChallenge &&
      (progressChallenge.challengeDate !== payload.challengeDate ||
        progressChallenge.challengeVersion !== resolvedDailyScheduleVersion ||
        progressChallenge.timezone !== resolvedTimezone)
    ) {
      return respondJson(
        { error: "Daily Challenge progress token does not match the requested puzzle." },
        { status: 409 },
      );
    }

    const scheduleEntry = tokenChallenge
      ? {
        date: tokenChallenge.challengeDate,
        sequence: tokenChallenge.challengeSequence,
        word: tokenChallenge.answerWord.toLowerCase(),
        wordLength: tokenChallenge.wordLength,
      }
      : await timing.timeStep("load_schedule_entry", () =>
        getDailyScheduleEntry(
          client,
          payload.challengeDate,
          resolvedDailyScheduleVersion,
        )
      );

    if (!scheduleEntry) {
      return respondJson(
        { error: "No Daily Challenge was found for that date." },
        { status: 404 },
      );
    }

    if (normalizedGuess.length !== scheduleEntry.wordLength) {
      return respondJson({
        authenticated: false,
        valid: false,
        guess: normalizedGuess,
        reason: `Word must be ${scheduleEntry.wordLength} letters long.`,
      });
    }

    const guessProfileEntry = await timing.timeStep("load_guess_profile_entry", () =>
      getLexiconProfileEntry(
        client,
        LEXICON_PROFILE_KEYS.DAILY_GUESS,
        normalizedGuess,
        scheduleEntry.wordLength,
      )
    );
    const guessEligibility = resolveDailyGuessEligibility({
      guess: normalizedGuess,
      scheduleWord: scheduleEntry.word,
      guessProfileEntry,
    });

    if (!guessEligibility.valid) {
      return respondJson({
        authenticated: false,
        valid: false,
        guess: normalizedGuess,
        reason: guessEligibility.reason,
      });
    }

    const solutionWord = scheduleEntry.word.toUpperCase();
    const formattedGuess = normalizedGuess.toUpperCase();
    const isWin = formattedGuess === solutionWord;
    const attemptNumber = (progressChallenge?.attemptCount ?? 0) + 1;
    const completed = isWin || attemptNumber >= MAX_DAILY_ATTEMPTS;
    const normalizedTotalTime = Math.max(
      payload.totalTime,
      progressChallenge?.totalTime ?? 0,
    );
    const rowResult = evaluateGuess(formattedGuess, solutionWord);

    if (!completed) {
      return respondJson({
        authenticated: false,
        completionToken: null,
        valid: true,
        guess: formattedGuess,
        progressToken: issueDailyChallengeProgressToken({
          attemptCount: attemptNumber,
          challengeDate: payload.challengeDate,
          challengeSequence: scheduleEntry.sequence,
          challengeVersion: resolvedDailyScheduleVersion,
          timezone: resolvedTimezone,
          totalTime: normalizedTotalTime,
          wordLength: scheduleEntry.wordLength,
        }),
        rowResult,
        isWin,
        recordSynced: false,
        session: null,
        solutionWord: undefined,
        communityStats: null,
      });
    }

    return respondJson({
      authenticated: false,
      completionToken: issueDailyChallengeCompletionToken({
        answerWord: solutionWord,
        attempts: attemptNumber,
        challengeDate: payload.challengeDate,
        challengeSequence: scheduleEntry.sequence,
        challengeVersion: resolvedDailyScheduleVersion,
        isWin,
        timezone: resolvedTimezone,
        totalTime: normalizedTotalTime,
        wordLength: scheduleEntry.wordLength,
      }),
      valid: true,
      guess: formattedGuess,
      progressToken: null,
      rowResult,
      isWin,
      solutionWord,
      session: null,
      record: null,
      recordSynced: false,
      communityStats: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return respondJson(
        { error: "The Daily Challenge guess payload is invalid." },
        { status: 400 },
      );
    }

    console.error("submit daily guess error:", error);

    return respondJson(
      { error: "Couldn't check your Daily Challenge guess. Please try again." },
      { status: 500 },
    );
  } finally {
    timing.log({
      status: responseStatus,
    });
    client.close();
  }
}
