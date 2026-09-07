import { NextResponse, type NextRequest } from "next/server";

import type { LexiconProfileKey } from "@/lib/lexicon-profile-keys";
import { getGameModeConfig, isEnabledWordLength } from "@/server/game-modes";
import { getRandomEligibleLexiconProfileWord } from "@/server/lexicon-profiles";
import { createTursoClient } from "@/server/turso";

export const runtime = "nodejs";

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

export async function GET(request: NextRequest) {
  const rawLength = request.nextUrl.searchParams.get("length");
  const wordLength = Number(rawLength ?? "5");

  if (
    !Number.isInteger(wordLength) ||
    wordLength < MIN_WORD_LENGTH ||
    wordLength > MAX_WORD_LENGTH
  ) {
    return NextResponse.json(
      { error: "Word length must be an integer between 3 and 8." },
      { status: 400 },
    );
  }

  const client = createTursoClient();

  try {
    const modeConfig = await getGameModeConfig(client, "unlimited");

    if (!modeConfig || !modeConfig.enabled) {
      return NextResponse.json(
        { error: "Unlimited mode is currently unavailable." },
        { status: 503 },
      );
    }

    if (!isEnabledWordLength(modeConfig, wordLength)) {
      return NextResponse.json(
        { error: "Unlimited mode is not configured for that word length." },
        { status: 400 },
      );
    }

    const wordEntry = await getRandomEligibleLexiconProfileWord(
      client,
      (modeConfig.answerProfileKey ?? modeConfig.guessProfileKey) as LexiconProfileKey,
      wordLength,
    );

    if (!wordEntry) {
      return NextResponse.json(
        { error: "Unlimited mode is unavailable for that word length." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      mode: "unlimited",
      word: wordEntry.word,
      wordLength: wordEntry.wordLength,
      difficulty: wordEntry.difficulty,
    });
  } finally {
    client.close();
  }
}
