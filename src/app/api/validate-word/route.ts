import { NextResponse, type NextRequest } from "next/server";

import { LEXICON_PROFILE_KEYS, isLexiconProfileKey } from "@/lib/lexicon-profile-keys";
import {
  getDailyGuessValidationLookup,
  getLexiconProfileEntry,
  resolveDailyGuessEligibility,
} from "@/server/lexicon-profiles";
import { createTursoClient } from "@/server/turso";

export const runtime = "edge";

const WORD_PATTERN = /^[a-zA-Z]+$/;
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

export async function GET(request: NextRequest) {
  const rawWord = request.nextUrl.searchParams.get("word") ?? "";
  const rawLength = request.nextUrl.searchParams.get("length");
  const rawProfile = request.nextUrl.searchParams.get("profile") ?? LEXICON_PROFILE_KEYS.UNLIMITED_GUESS;
  const challengeDate = request.nextUrl.searchParams.get("challengeDate");
  const challengeVersion = request.nextUrl.searchParams.get("challengeVersion");
  const word = rawWord.trim().toLowerCase();
  const length = Number(rawLength ?? word.length);

  if (!isLexiconProfileKey(rawProfile)) {
    return NextResponse.json(
      {
        valid: false,
        word,
        reason: "Unknown validation profile.",
      },
      { status: 400 },
    );
  }

  if (
    !WORD_PATTERN.test(word) ||
    !Number.isInteger(length) ||
    length < MIN_WORD_LENGTH ||
    length > MAX_WORD_LENGTH ||
    word.length !== length
  ) {
    return NextResponse.json(
      {
        valid: false,
        word,
        reason: "Word must be 3-8 alphabetic characters and match the requested length.",
      },
      { status: 400 },
    );
  }

  const client = createTursoClient();

  try {
    if (
      rawProfile === LEXICON_PROFILE_KEYS.DAILY_GUESS &&
      challengeDate &&
      challengeVersion
    ) {
      const lookup = await getDailyGuessValidationLookup(
        client,
        challengeDate,
        challengeVersion,
        rawProfile,
        word,
      );

      if (!lookup.scheduleEntry) {
        return NextResponse.json({
          valid: false,
          word,
          profile: rawProfile,
          source: "daily_schedule",
          status: "missing_schedule",
          reason: "No Daily Challenge was found for that date.",
        });
      }

      const expectedLength = lookup.scheduleEntry.wordLength;

      if (word.length !== expectedLength) {
        return NextResponse.json({
          valid: false,
          word,
          profile: rawProfile,
          source: "daily_schedule",
          status: "length_mismatch",
          reason: `Word must be ${expectedLength} letters long.`,
        });
      }

      const validation = resolveDailyGuessEligibility({
        guess: word,
        scheduleWord: lookup.scheduleEntry?.word ?? null,
        guessProfileEntry: lookup.guessProfileEntry,
      });

      return NextResponse.json({
        valid: validation.valid,
        word,
        profile: rawProfile,
        source: validation.source,
        status: validation.status,
        reason: validation.reason,
      });
    }

    const profileEntry = await getLexiconProfileEntry(client, rawProfile, word, length);
    const isValid = profileEntry?.eligible === true;

    return NextResponse.json({
      valid: isValid,
      word,
      profile: rawProfile,
      source: profileEntry ? "lexicon_profiles" : "missing",
      status: profileEntry?.status ?? "missing",
      reason: profileEntry?.reason || "Word is not in the allowed word list for this game mode.",
    });
  } finally {
    client.close();
  }
}
