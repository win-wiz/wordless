import type { Client } from "@libsql/client";

import type { LexiconProfileKey } from "@/lib/lexicon-profile-keys";

const LEXICON_PROFILE_CACHE_TTL_MS = 2 * 60 * 1000;
const LEXICON_PROFILE_CACHE_MAX_SIZE = 2048;

export type LexiconProfileEntry = {
  eligible: boolean;
  reason: string;
  score: number;
  status: string;
  word: string;
  wordLength: number;
};

export type DailyGuessValidationLookup = {
  scheduleEntry: {
    date: string;
    difficulty: string;
    sequence: number;
    word: string;
    wordLength: number;
  } | null;
  guessProfileEntry: LexiconProfileEntry | null;
};

export type RandomLexiconProfileWord = {
  difficulty: string;
  score: number;
  word: string;
  wordLength: number;
};

export type DailyGuessEligibilityResult = {
  valid: boolean;
  reason: string;
  source: "solution_word" | "lexicon_profiles" | "missing";
  status: string;
};

const lexiconProfileCache = new Map<
  string,
  { expiresAt: number; value: LexiconProfileEntry | null }
>();

function readCachedValue<T>(
  cache: Map<string, { expiresAt: number; value: T }>,
  cacheKey: string,
) {
  const cached = cache.get(cacheKey);

  if (!cached) {
    return { hit: false as const, value: null as T | null };
  }

  if (cached.expiresAt <= Date.now()) {
    cache.delete(cacheKey);
    return { hit: false as const, value: null as T | null };
  }

  cache.delete(cacheKey);
  cache.set(cacheKey, cached);

  return { hit: true as const, value: cached.value };
}

function writeCachedValue<T>(
  cache: Map<string, { expiresAt: number; value: T }>,
  cacheKey: string,
  value: T,
) {
  if (cache.size >= LEXICON_PROFILE_CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(cacheKey, {
    value,
    expiresAt: Date.now() + LEXICON_PROFILE_CACHE_TTL_MS,
  });
}

function getLexiconProfileCacheKey(
  profileKey: LexiconProfileKey,
  word: string,
  wordLength: number,
) {
  return `${profileKey}:${wordLength}:${word}`;
}

function mapLexiconProfileEntry(row: Record<string, unknown>): LexiconProfileEntry {
  return {
    eligible: Number(row.eligible) === 1,
    reason: String(row.reason ?? ""),
    score: Number(row.score ?? 0),
    status: String(row.status ?? "auto"),
    word: String(row.word),
    wordLength: Number(row.word_length),
  };
}

export async function getLexiconProfileEntry(
  client: Client,
  profileKey: LexiconProfileKey,
  word: string,
  wordLength: number,
): Promise<LexiconProfileEntry | null> {
  const cacheKey = getLexiconProfileCacheKey(profileKey, word, wordLength);
  const cached = readCachedValue(lexiconProfileCache, cacheKey);

  if (cached.hit) {
    return cached.value;
  }

  const result = await client.execute({
    sql: `
      SELECT
        lp.eligible,
        lp.reason,
        lp.score,
        lp.status,
        lp.word,
        lp.word_length
      FROM lexicon_profiles lp
      WHERE lp.profile_key = ?
        AND lp.word = ?
        AND lp.word_length = ?
      LIMIT 1
    `,
    args: [profileKey, word, wordLength],
  });

  const row = result.rows[0];

  if (!row) {
    writeCachedValue(lexiconProfileCache, cacheKey, null);
    return null;
  }

  const entry = mapLexiconProfileEntry(row as Record<string, unknown>);
  writeCachedValue(lexiconProfileCache, cacheKey, entry);

  return entry;
}

export async function getDailyGuessValidationLookup(
  client: Client,
  challengeDate: string,
  version: string,
  profileKey: LexiconProfileKey,
  guess: string,
) {
  const scheduleResult = await client.execute({
    sql: `
      SELECT
        ds.challenge_date,
        ds.word AS solution_word,
        ds.difficulty,
        ds.sequence,
        lw.word_length
      FROM daily_schedule ds
      JOIN lexicon_words lw ON lw.word = ds.word
      WHERE ds.challenge_date = ?
        AND ds.version = ?
      LIMIT 1
    `,
    args: [challengeDate, version],
  });

  const row = scheduleResult.rows[0] as Record<string, unknown> | undefined;
  const scheduleEntry = row
    ? {
        date: String(row.challenge_date),
        word: String(row.solution_word),
        difficulty: String(row.difficulty),
        sequence: Number(row.sequence),
        wordLength: Number(row.word_length),
      }
    : null;
  const guessProfileEntry = scheduleEntry
    ? await getLexiconProfileEntry(
      client,
      profileKey,
      guess,
      scheduleEntry.wordLength,
    )
    : null;
  const lookup: DailyGuessValidationLookup = {
    scheduleEntry,
    guessProfileEntry,
  };

  return lookup;
}

export function resolveDailyGuessEligibility({
  guess,
  scheduleWord,
  guessProfileEntry,
}: {
  guess: string;
  scheduleWord: string | null;
  guessProfileEntry: LexiconProfileEntry | null;
}): DailyGuessEligibilityResult {
  const normalizedGuess = guess.trim().toLowerCase();
  const normalizedScheduleWord = scheduleWord?.trim().toLowerCase() ?? null;

  if (normalizedScheduleWord && normalizedGuess === normalizedScheduleWord) {
    return {
      valid: true,
      reason: "",
      source: "solution_word",
      status: "solution_word",
    };
  }

  if (guessProfileEntry?.eligible === true) {
    return {
      valid: true,
      reason: "",
      source: "lexicon_profiles",
      status: guessProfileEntry.status,
    };
  }

  return {
    valid: false,
    reason:
      guessProfileEntry?.reason ||
      "Word is not in the allowed word list for this game mode.",
    source: guessProfileEntry ? "lexicon_profiles" : "missing",
    status: guessProfileEntry?.status ?? "missing",
  };
}

export async function fetchEligibleLexiconProfileWords(
  client: Client,
  profileKey: LexiconProfileKey,
  wordLength: number,
) {
  const result = await client.execute({
    sql: `
      SELECT
        lw.word,
        lw.difficulty,
        lp.score
      FROM lexicon_profiles lp
      JOIN lexicon_words lw ON lw.word = lp.word
      WHERE lp.profile_key = ?
        AND lp.word_length = ?
        AND lp.eligible = 1
      ORDER BY lp.score DESC, lw.word ASC
    `,
    args: [profileKey, wordLength],
  });

  return result.rows.map((row) => ({
    difficulty: String(row.difficulty),
    score: Number(row.score ?? 0),
    word: String(row.word),
  }));
}

export async function getRandomEligibleLexiconProfileWord(
  client: Client,
  profileKey: LexiconProfileKey,
  wordLength: number,
): Promise<RandomLexiconProfileWord | null> {
  const result = await client.execute({
    sql: `
      SELECT
        lw.word,
        lw.word_length,
        lw.difficulty,
        lp.score
      FROM lexicon_profiles lp
      JOIN lexicon_words lw ON lw.word = lp.word
      WHERE lp.profile_key = ?
        AND lp.word_length = ?
        AND lp.eligible = 1
      ORDER BY RANDOM()
      LIMIT 1
    `,
    args: [profileKey, wordLength],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    difficulty: String(row.difficulty),
    score: Number(row.score ?? 0),
    word: String(row.word),
    wordLength: Number(row.word_length),
  };
}
