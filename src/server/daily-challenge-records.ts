import type { Client } from "@libsql/client";

import {
  getDateKeyForTimezone,
} from "@/server/daily-schedule";
import { randomHex } from "@/server/edge-crypto";
import type {
  DailyChallengeCommunityStats,
  DailyChallengeHistoryEntry,
  DailyChallengeRecord,
  DailyChallengeSession,
  DailyChallengeStats,
} from "@/types/auth";
import type { EvaluatedLetterState } from "@/lib/game-state";

const MAX_DAILY_ATTEMPTS = 6;
const COMMUNITY_STATS_CACHE_TTL_MS = 30 * 1000;

const dailyChallengeCommunityStatsCache = new Map<
  string,
  { expiresAt: number; value: DailyChallengeCommunityStats | null }
>();

type RecordInput = {
  userId: string;
  challengeDate: string;
  challengeVersion: string;
  challengeSequence: number;
  answerWord: string;
  wordLength: number;
  isWin: boolean;
  attempts: number;
  maxAttempts: number;
  totalTime: number;
  pattern?: string;
};

type PersistedRecord = RecordInput & {
  id: string;
  completedAt: string;
  updatedAt: string;
};

type SessionInput = {
  userId: string;
  challengeDate: string;
  challengeVersion: string;
  challengeSequence: number;
  wordLength: number;
  attemptCount: number;
  totalTime: number;
  guesses: string[];
  rowResults: EvaluatedLetterState[][];
  completed: boolean;
  isWin: boolean | null;
};

function getCommunityStatsCacheKey(
  challengeDate: string,
  challengeVersion: string,
) {
  return `${challengeVersion}:${challengeDate}`;
}

function readCachedCommunityStats(
  challengeDate: string,
  challengeVersion: string,
) {
  const cacheKey = getCommunityStatsCacheKey(challengeDate, challengeVersion);
  const cached = dailyChallengeCommunityStatsCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    dailyChallengeCommunityStatsCache.delete(cacheKey);
    return null;
  }

  return cached.value;
}

function writeCachedCommunityStats(
  challengeDate: string,
  challengeVersion: string,
  value: DailyChallengeCommunityStats | null,
) {
  dailyChallengeCommunityStatsCache.set(
    getCommunityStatsCacheKey(challengeDate, challengeVersion),
    {
      value,
      expiresAt: Date.now() + COMMUNITY_STATS_CACHE_TTL_MS,
    },
  );
}

function invalidateCachedCommunityStats(
  challengeDate: string,
  challengeVersion: string,
) {
  dailyChallengeCommunityStatsCache.delete(
    getCommunityStatsCacheKey(challengeDate, challengeVersion),
  );
}

function buildDailyChallengeRecord(record: PersistedRecord): DailyChallengeRecord {
  return {
    challengeDate: record.challengeDate,
    challengeVersion: record.challengeVersion,
    challengeSequence: record.challengeSequence,
    answerWord: record.answerWord.toUpperCase(),
    wordLength: record.wordLength,
    isWin: record.isWin,
    attempts: record.attempts,
    maxAttempts: record.maxAttempts,
    totalTime: record.totalTime,
    pattern: record.pattern ?? null,
    completedAt: record.completedAt,
    updatedAt: record.updatedAt,
  };
}

function buildDailyChallengeSession(
  session: SessionInput,
  updatedAt: string,
  answerWord?: string | null,
): DailyChallengeSession {
  return {
    challengeDate: session.challengeDate,
    challengeVersion: session.challengeVersion,
    challengeSequence: session.challengeSequence,
    wordLength: session.wordLength,
    attemptCount: session.attemptCount,
    totalTime: session.totalTime,
    guesses: session.guesses.map((guess) => guess.toUpperCase()),
    rowResults: session.rowResults,
    completed: session.completed,
    isWin: session.isWin,
    solutionWord: answerWord ? answerWord.toUpperCase() : null,
    updatedAt,
  };
}

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function mapDailyChallengeRecord(row: Record<string, unknown>): DailyChallengeRecord {
  return {
    challengeDate: String(row.challenge_date),
    challengeVersion: String(row.challenge_version),
    challengeSequence: Number(row.challenge_sequence),
    answerWord: String(row.answer_word).toUpperCase(),
    wordLength: Number(row.word_length),
    isWin: Number(row.is_win) === 1,
    attempts: Number(row.attempts),
    maxAttempts: Number(row.max_attempts),
    totalTime: Number(row.total_time),
    pattern: row.pattern ? String(row.pattern) : null,
    completedAt: String(row.completed_at),
    updatedAt: String(row.updated_at),
  };
}

function mapDailyChallengeSession(
  row: Record<string, unknown>,
): DailyChallengeSession {
  const guesses = parseJsonArray<string>(row.guesses_json, []).map((guess) =>
    String(guess).toUpperCase(),
  );
  const rowResults = parseJsonArray<EvaluatedLetterState[]>(
    row.row_results_json,
    [],
  ).map((states) =>
    Array.isArray(states)
      ? states
          .map((state) => String(state))
          .filter(
            (state): state is EvaluatedLetterState =>
              state === "correct" || state === "present" || state === "absent",
          )
      : [],
  );

  return {
    challengeDate: String(row.challenge_date),
    challengeVersion: String(row.challenge_version),
    challengeSequence: Number(row.challenge_sequence),
    wordLength: Number(row.word_length),
    attemptCount: Number(row.attempt_count),
    totalTime: Number(row.total_time),
    guesses,
    rowResults,
    completed: Number(row.completed) === 1,
    isWin:
      row.is_win === null || row.is_win === undefined
        ? null
        : Number(row.is_win) === 1,
    solutionWord: row.answer_word ? String(row.answer_word).toUpperCase() : null,
    updatedAt: String(row.updated_at),
  };
}

function addUtcDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isPreviousUtcDate(previousDateKey: string, nextDateKey: string) {
  return addUtcDays(previousDateKey, 1) === nextDateKey;
}

async function getRecentDailyChallengeHistory(
  client: Client,
  userId: string,
  challengeDate: string,
  challengeVersion: string,
): Promise<DailyChallengeHistoryEntry[]> {
  const startDate = addUtcDays(challengeDate, -6);
  const result = await client.execute({
    sql: `
      SELECT
        ds.challenge_date,
        ds.sequence,
        dcr.is_win,
        dcr.attempts,
        dcr.total_time,
        dcr.challenge_date AS completed_date
      FROM daily_schedule ds
      LEFT JOIN daily_challenge_records dcr
        ON dcr.user_id = ?
        AND dcr.challenge_date = ds.challenge_date
        AND dcr.challenge_version = ds.version
      WHERE ds.challenge_date BETWEEN ? AND ?
        AND ds.version = ?
      ORDER BY ds.challenge_date ASC
    `,
      args: [userId, startDate, challengeDate, challengeVersion],
  });

  return result.rows.map((row) => ({
    date: String(row.challenge_date),
    sequence: Number(row.sequence),
    completed: Boolean(row.completed_date),
    isWin: row.completed_date ? Number(row.is_win) === 1 : null,
    attempts: row.completed_date ? Number(row.attempts) : null,
    totalTime: row.completed_date ? Number(row.total_time) : null,
    isToday: String(row.challenge_date) === challengeDate,
  }));
}

function choosePreferredRecord(
  existing: DailyChallengeRecord | null,
  incoming: PersistedRecord,
) {
  if (!existing) {
    return {
      record: incoming,
      action: "inserted" as const,
    };
  }

  if (existing.isWin && !incoming.isWin) {
    return {
      record: {
        ...incoming,
        id: randomHex(16),
        isWin: existing.isWin,
        attempts: existing.attempts,
        maxAttempts: existing.maxAttempts,
        totalTime: existing.totalTime,
        pattern: existing.pattern ?? incoming.pattern,
        completedAt: existing.completedAt,
        updatedAt: existing.updatedAt,
      },
      action: "kept" as const,
    };
  }

  if (!existing.isWin && incoming.isWin) {
    return {
      record: incoming,
      action: "updated" as const,
    };
  }

  if (!existing.isWin && !incoming.isWin) {
    return {
      record: {
        ...incoming,
        id: randomHex(16),
        isWin: existing.isWin,
        attempts: existing.attempts,
        maxAttempts: existing.maxAttempts,
        totalTime: existing.totalTime,
        pattern: existing.pattern ?? incoming.pattern,
        completedAt: existing.completedAt,
        updatedAt: existing.updatedAt,
      },
      action: "kept" as const,
    };
  }

  const existingScore = {
    attempts: existing.attempts,
    totalTime: existing.totalTime,
  };
  const incomingScore = {
    attempts: incoming.attempts,
    totalTime: incoming.totalTime,
  };

  const shouldReplace =
    incomingScore.attempts < existingScore.attempts ||
    (incomingScore.attempts === existingScore.attempts &&
      incomingScore.totalTime < existingScore.totalTime);

  if (!shouldReplace) {
    return {
      record: {
        ...incoming,
        id: randomHex(16),
        isWin: existing.isWin,
        attempts: existing.attempts,
        maxAttempts: existing.maxAttempts,
        totalTime: existing.totalTime,
        pattern: existing.pattern ?? incoming.pattern,
        completedAt: existing.completedAt,
        updatedAt: existing.updatedAt,
      },
      action: "kept" as const,
    };
  }

  return {
    record: incoming,
    action: "updated" as const,
  };
}

export async function getDailyChallengeRecord(
  client: Client,
  userId: string,
  challengeDate: string,
  challengeVersion: string,
) {
  const result = await client.execute({
    sql: `
      SELECT
        challenge_date,
        challenge_version,
        challenge_sequence,
        answer_word,
        word_length,
        is_win,
        attempts,
        max_attempts,
        total_time,
        pattern,
        completed_at,
        updated_at
      FROM daily_challenge_records
      WHERE user_id = ?
        AND challenge_date = ?
        AND challenge_version = ?
      LIMIT 1
    `,
    args: [userId, challengeDate, challengeVersion],
  });

  const row = result.rows[0];
  return row ? mapDailyChallengeRecord(row as Record<string, unknown>) : null;
}

export async function getDailyChallengeSession(
  client: Client,
  userId: string,
  challengeDate: string,
  challengeVersion: string,
) {
  const result = await client.execute({
    sql: `
      SELECT
        dcs.challenge_date,
        dcs.challenge_version,
        dcs.challenge_sequence,
        dcs.word_length,
        dcs.attempt_count,
        dcs.total_time,
        dcs.guesses_json,
        dcs.row_results_json,
        dcs.completed,
        dcs.is_win,
        dcs.updated_at,
        ds.word AS answer_word
      FROM daily_challenge_sessions dcs
      LEFT JOIN daily_schedule ds
        ON ds.challenge_date = dcs.challenge_date
        AND ds.version = dcs.challenge_version
      WHERE dcs.user_id = ?
        AND dcs.challenge_date = ?
        AND dcs.challenge_version = ?
      LIMIT 1
    `,
    args: [userId, challengeDate, challengeVersion],
  });

  const row = result.rows[0];
  return row ? mapDailyChallengeSession(row as Record<string, unknown>) : null;
}

async function upsertDailyChallengeSession(
  client: Client,
  input: SessionInput,
) {
  const now = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO daily_challenge_sessions (
        id,
        user_id,
        challenge_date,
        challenge_version,
        challenge_sequence,
        word_length,
        attempt_count,
        total_time,
        guesses_json,
        row_results_json,
        completed,
        is_win,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, challenge_date, challenge_version) DO UPDATE SET
        challenge_version = excluded.challenge_version,
        challenge_sequence = excluded.challenge_sequence,
        word_length = excluded.word_length,
        attempt_count = excluded.attempt_count,
        total_time = excluded.total_time,
        guesses_json = excluded.guesses_json,
        row_results_json = excluded.row_results_json,
        completed = excluded.completed,
        is_win = excluded.is_win,
        updated_at = excluded.updated_at
    `,
    args: [
      randomHex(16),
      input.userId,
      input.challengeDate,
      input.challengeVersion,
      input.challengeSequence,
      input.wordLength,
      input.attemptCount,
      input.totalTime,
      JSON.stringify(input.guesses),
      JSON.stringify(input.rowResults),
      input.completed ? 1 : 0,
      input.isWin === null ? null : input.isWin ? 1 : 0,
      now,
    ],
  });

  return buildDailyChallengeSession(input, now);
}

export async function recordDailyChallengeGuess(
  client: Client,
  input: {
    userId: string;
    challengeDate: string;
    challengeVersion: string;
    challengeSequence: number;
    wordLength: number;
    guess: string;
    rowResult: EvaluatedLetterState[];
    totalTime: number;
    isWin: boolean;
  },
) {
  const existing = await getDailyChallengeSession(
    client,
    input.userId,
    input.challengeDate,
    input.challengeVersion,
  );

  if (existing?.completed) {
    return {
      accepted: false,
      reason: "completed" as const,
      session: existing,
    };
  }

  const guesses = [...(existing?.guesses ?? []), input.guess.toUpperCase()];
  const rowResults = [...(existing?.rowResults ?? []), input.rowResult];
  const attemptCount = guesses.length;
  const totalTime = Math.max(existing?.totalTime ?? 0, input.totalTime);
  const completed = input.isWin || attemptCount >= MAX_DAILY_ATTEMPTS;
  const nextSessionInput: SessionInput = {
    userId: input.userId,
    challengeDate: input.challengeDate,
    challengeVersion: input.challengeVersion,
    challengeSequence: input.challengeSequence,
    wordLength: input.wordLength,
    attemptCount,
    totalTime,
    guesses,
    rowResults,
    completed,
    isWin: completed ? input.isWin : null,
  };
  const session = await upsertDailyChallengeSession(client, nextSessionInput);

  return {
    accepted: true,
    reason: null,
    session,
  };
}

export async function getDailyChallengeStats(
  client: Client,
  userId: string,
  challengeDate: string,
  challengeVersion: string,
  timezone = "UTC",
): Promise<DailyChallengeStats> {
  const result = await client.execute({
    sql: `
      SELECT
        challenge_date,
        challenge_version,
        challenge_sequence,
        answer_word,
        word_length,
        is_win,
        attempts,
        max_attempts,
        total_time,
        pattern,
        completed_at,
        updated_at
      FROM daily_challenge_records
      WHERE user_id = ?
        AND challenge_version = ?
      ORDER BY challenge_date ASC
    `,
    args: [userId, challengeVersion],
  });

  const records = result.rows.map((row) =>
    mapDailyChallengeRecord(row as Record<string, unknown>),
  );
  const todayRecord =
    records.find((record) => record.challengeDate === challengeDate) ?? null;
  const winningRecords = records.filter((record) => record.isWin);
  const bestWinRecord = winningRecords.reduce<DailyChallengeRecord | null>(
    (bestRecord, record) => {
      if (!bestRecord) {
        return record;
      }

      if (record.attempts < bestRecord.attempts) {
        return record;
      }

      if (
        record.attempts === bestRecord.attempts &&
        record.totalTime < bestRecord.totalTime
      ) {
        return record;
      }

      return bestRecord;
    },
    null,
  );

  let maxStreak = 0;
  let runningStreak = 0;

  for (const [index, record] of records.entries()) {
    if (index === 0) {
      runningStreak = 1;
    } else {
      const previousRecord = records[index - 1];
      runningStreak =
        previousRecord &&
        isPreviousUtcDate(previousRecord.challengeDate, record.challengeDate)
          ? runningStreak + 1
          : 1;
    }

    if (runningStreak > maxStreak) {
      maxStreak = runningStreak;
    }
  }

  let currentStreak = 0;
  const recentHistory = await getRecentDailyChallengeHistory(
    client,
    userId,
    challengeDate,
    challengeVersion,
  );

  if (todayRecord && challengeDate === getDateKeyForTimezone(timezone)) {
    const recordDates = new Set(records.map((record) => record.challengeDate));
    let cursor = challengeDate;

    while (recordDates.has(cursor)) {
      currentStreak += 1;
      cursor = addUtcDays(cursor, -1);
    }
  }

  return {
    completedToday: Boolean(todayRecord),
    todayRecord,
    bestWinRecord,
    currentStreak,
    maxStreak,
    totalCompleted: records.length,
    totalWins: winningRecords.length,
    recentHistory,
  };
}

export async function getDailyChallengeCommunityStats(
  client: Client,
  challengeDate: string,
  challengeVersion: string,
): Promise<DailyChallengeCommunityStats | null> {
  const cached = readCachedCommunityStats(challengeDate, challengeVersion);

  if (cached !== null) {
    return cached;
  }

  const result = await client.execute({
    sql: `
      SELECT
        COUNT(*) AS total_completed,
        SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) AS total_wins,
        SUM(CASE WHEN is_win = 0 THEN 1 ELSE 0 END) AS failed_count,
        SUM(CASE WHEN is_win = 1 AND attempts = 1 THEN 1 ELSE 0 END) AS wins_in_1,
        SUM(CASE WHEN is_win = 1 AND attempts = 2 THEN 1 ELSE 0 END) AS wins_in_2,
        SUM(CASE WHEN is_win = 1 AND attempts = 3 THEN 1 ELSE 0 END) AS wins_in_3,
        SUM(CASE WHEN is_win = 1 AND attempts = 4 THEN 1 ELSE 0 END) AS wins_in_4,
        SUM(CASE WHEN is_win = 1 AND attempts = 5 THEN 1 ELSE 0 END) AS wins_in_5,
        SUM(CASE WHEN is_win = 1 AND attempts = 6 THEN 1 ELSE 0 END) AS wins_in_6
      FROM daily_challenge_records
      WHERE challenge_date = ?
        AND challenge_version = ?
    `,
    args: [challengeDate, challengeVersion],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const totalCompleted = Number(row.total_completed ?? 0);

  if (totalCompleted <= 0) {
    writeCachedCommunityStats(challengeDate, challengeVersion, null);
    return null;
  }

  const stats = {
    challengeDate,
    totalCompleted,
    totalWins: Number(row.total_wins ?? 0),
    failedCount: Number(row.failed_count ?? 0),
    guessDistribution: [
      Number(row.wins_in_1 ?? 0),
      Number(row.wins_in_2 ?? 0),
      Number(row.wins_in_3 ?? 0),
      Number(row.wins_in_4 ?? 0),
      Number(row.wins_in_5 ?? 0),
      Number(row.wins_in_6 ?? 0),
    ],
  };

  writeCachedCommunityStats(challengeDate, challengeVersion, stats);

  return stats;
}

export async function saveFreshDailyChallengeRecord(
  client: Client,
  input: RecordInput,
) {
  const now = new Date().toISOString();
  const persisted: PersistedRecord = {
    id: randomHex(16),
    ...input,
    completedAt: now,
    updatedAt: now,
  };

  await client.execute({
    sql: `
      INSERT INTO daily_challenge_records (
        id,
        user_id,
        challenge_date,
        challenge_version,
        challenge_sequence,
        answer_word,
        word_length,
        is_win,
        attempts,
        max_attempts,
        total_time,
        pattern,
        completed_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, challenge_date, challenge_version) DO UPDATE SET
        challenge_sequence = excluded.challenge_sequence,
        answer_word = excluded.answer_word,
        word_length = excluded.word_length,
        is_win = excluded.is_win,
        attempts = excluded.attempts,
        max_attempts = excluded.max_attempts,
        total_time = excluded.total_time,
        pattern = COALESCE(daily_challenge_records.pattern, excluded.pattern),
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `,
    args: [
      persisted.id,
      persisted.userId,
      persisted.challengeDate,
      persisted.challengeVersion,
      persisted.challengeSequence,
      persisted.answerWord.toLowerCase(),
      persisted.wordLength,
      persisted.isWin ? 1 : 0,
      persisted.attempts,
      persisted.maxAttempts,
      persisted.totalTime,
      persisted.pattern ?? null,
      persisted.completedAt,
      persisted.updatedAt,
    ],
  });

  invalidateCachedCommunityStats(input.challengeDate, input.challengeVersion);

  return {
    action: "inserted" as const,
    record: buildDailyChallengeRecord(persisted),
  };
}

export async function saveDailyChallengeRecord(client: Client, input: RecordInput) {
  const existing = await getDailyChallengeRecord(
    client,
    input.userId,
    input.challengeDate,
    input.challengeVersion,
  );
  const now = new Date().toISOString();
  const incomingRecord: PersistedRecord = {
    id: randomHex(16),
    ...input,
    completedAt: now,
    updatedAt: now,
  };
  const selection = choosePreferredRecord(existing, incomingRecord);
  const persisted = selection.record;

  await client.execute({
    sql: `
      INSERT INTO daily_challenge_records (
        id,
        user_id,
        challenge_date,
        challenge_version,
        challenge_sequence,
        answer_word,
        word_length,
        is_win,
        attempts,
        max_attempts,
        total_time,
        pattern,
        completed_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, challenge_date, challenge_version) DO UPDATE SET
        challenge_version = excluded.challenge_version,
        challenge_sequence = excluded.challenge_sequence,
        answer_word = excluded.answer_word,
        word_length = excluded.word_length,
        is_win = excluded.is_win,
        attempts = excluded.attempts,
        max_attempts = excluded.max_attempts,
        total_time = excluded.total_time,
        pattern = excluded.pattern,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `,
    args: [
      persisted.id,
      persisted.userId,
      persisted.challengeDate,
      persisted.challengeVersion,
      persisted.challengeSequence,
      persisted.answerWord.toLowerCase(),
      persisted.wordLength,
      persisted.isWin ? 1 : 0,
      persisted.attempts,
      persisted.maxAttempts,
      persisted.totalTime,
      persisted.pattern ?? null,
      persisted.completedAt,
      now,
    ],
  });

  invalidateCachedCommunityStats(input.challengeDate, input.challengeVersion);

  return {
    action: selection.action,
    record: buildDailyChallengeRecord(persisted),
  };
}
