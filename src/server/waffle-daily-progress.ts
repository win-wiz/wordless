import type { Client } from "@libsql/client";
import { randomBytes } from "node:crypto";

import type {
  WaffleDailyCommunityStats,
  WaffleDailyHistoryEntry,
  WaffleDailyRecord,
  WaffleDailySession,
  WaffleDailyStats,
} from "@/types/waffle";
import { getWaffleDateKey } from "@/server/waffle-puzzles";

type WaffleRecordInput = {
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  isWin: boolean;
  maxSwaps: number;
  puzzleId: string;
  stars: number;
  swapsUsed: number;
  totalTime: number;
  userId: string;
};

type PersistedWaffleRecord = WaffleRecordInput & {
  completedAt: string;
  id: string;
  updatedAt: string;
};

type WaffleSessionInput = {
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  completed: boolean;
  currentLetters: string[];
  isWin: boolean | null;
  maxSwaps: number;
  puzzleId: string;
  revealed: boolean;
  swapsUsed: number;
  totalTime: number;
  userId: string;
};

function parseJsonStringArray(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed
          .map((entry) => String(entry).toLowerCase())
          .filter((entry) => /^[a-z]$/.test(entry))
      : [];
  } catch {
    return [];
  }
}

function mapWaffleDailySession(row: Record<string, unknown>): WaffleDailySession {
  return {
    challengeDate: String(row.challenge_date),
    challengeSequence: Number(row.challenge_sequence),
    challengeVersion: String(row.challenge_version),
    completed: Number(row.completed) === 1,
    currentLetters: parseJsonStringArray(row.current_letters_json),
    isWin:
      row.is_win === null || row.is_win === undefined
        ? null
        : Number(row.is_win) === 1,
    maxSwaps: Number(row.max_swaps),
    puzzleId: String(row.puzzle_id),
    revealed: Number(row.revealed) === 1,
    swapsUsed: Number(row.swaps_used),
    totalTime: Number(row.total_time),
    updatedAt: String(row.updated_at),
  };
}

function mapWaffleDailyRecord(row: Record<string, unknown>): WaffleDailyRecord {
  return {
    challengeDate: String(row.challenge_date),
    challengeSequence: Number(row.challenge_sequence),
    challengeVersion: String(row.challenge_version),
    completedAt: String(row.completed_at),
    isWin: Number(row.is_win) === 1,
    maxSwaps: Number(row.max_swaps),
    puzzleId: String(row.puzzle_id),
    stars: Number(row.stars),
    swapsUsed: Number(row.swaps_used),
    totalTime: Number(row.total_time),
    updatedAt: String(row.updated_at),
  };
}

function buildWaffleDailySession(
  session: WaffleSessionInput,
  updatedAt: string,
): WaffleDailySession {
  return {
    challengeDate: session.challengeDate,
    challengeSequence: session.challengeSequence,
    challengeVersion: session.challengeVersion,
    completed: session.completed,
    currentLetters: session.currentLetters,
    isWin: session.isWin,
    maxSwaps: session.maxSwaps,
    puzzleId: session.puzzleId,
    revealed: session.revealed,
    swapsUsed: session.swapsUsed,
    totalTime: session.totalTime,
    updatedAt,
  };
}

function buildWaffleDailyRecord(record: PersistedWaffleRecord): WaffleDailyRecord {
  return {
    challengeDate: record.challengeDate,
    challengeSequence: record.challengeSequence,
    challengeVersion: record.challengeVersion,
    completedAt: record.completedAt,
    isWin: record.isWin,
    maxSwaps: record.maxSwaps,
    puzzleId: record.puzzleId,
    stars: record.stars,
    swapsUsed: record.swapsUsed,
    totalTime: record.totalTime,
    updatedAt: record.updatedAt,
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

async function getRecentWaffleDailyHistory(
  client: Client,
  userId: string,
  challengeDate: string,
  challengeVersion: string,
): Promise<WaffleDailyHistoryEntry[]> {
  const startDate = addUtcDays(challengeDate, -6);
  const result = await client.execute({
    sql: `
      SELECT
        wds.challenge_date,
        wds.sequence,
        wdr.completed_at,
        wdr.is_win,
        wdr.stars,
        wdr.swaps_used,
        wdr.total_time
      FROM waffle_daily_schedule wds
      LEFT JOIN waffle_daily_records wdr
        ON wdr.user_id = ?
        AND wdr.challenge_date = wds.challenge_date
        AND wdr.challenge_version = wds.version
      WHERE wds.challenge_date BETWEEN ? AND ?
        AND wds.version = ?
      ORDER BY wds.challenge_date ASC
    `,
    args: [userId, startDate, challengeDate, challengeVersion],
  });

  return result.rows.map((row) => ({
    date: String(row.challenge_date),
    sequence: Number(row.sequence ?? 0),
    completed: Boolean(row.completed_at),
    isWin: row.completed_at ? Number(row.is_win) === 1 : null,
    stars: row.completed_at ? Number(row.stars ?? 0) : null,
    swapsUsed: row.completed_at ? Number(row.swaps_used ?? 0) : null,
    totalTime: row.completed_at ? Number(row.total_time ?? 0) : null,
    isToday: String(row.challenge_date) === challengeDate,
  }));
}

function choosePreferredWaffleRecord(
  existing: WaffleDailyRecord | null,
  incoming: PersistedWaffleRecord,
) {
  if (!existing) {
    return {
      action: "inserted" as const,
      record: incoming,
    };
  }

  if (existing.isWin && !incoming.isWin) {
    return {
      action: "kept" as const,
      record: {
        ...incoming,
        completedAt: existing.completedAt,
        id: randomBytes(16).toString("hex"),
        isWin: existing.isWin,
        stars: existing.stars,
        swapsUsed: existing.swapsUsed,
        totalTime: existing.totalTime,
        updatedAt: existing.updatedAt,
      },
    };
  }

  if (!existing.isWin && incoming.isWin) {
    return {
      action: "updated" as const,
      record: incoming,
    };
  }

  if (!existing.isWin && !incoming.isWin) {
    return {
      action: "kept" as const,
      record: {
        ...incoming,
        completedAt: existing.completedAt,
        id: randomBytes(16).toString("hex"),
        isWin: existing.isWin,
        stars: existing.stars,
        swapsUsed: existing.swapsUsed,
        totalTime: existing.totalTime,
        updatedAt: existing.updatedAt,
      },
    };
  }

  const shouldReplace =
    incoming.stars > existing.stars ||
    (incoming.stars === existing.stars && incoming.swapsUsed < existing.swapsUsed) ||
    (incoming.stars === existing.stars &&
      incoming.swapsUsed === existing.swapsUsed &&
      incoming.totalTime < existing.totalTime);

  if (!shouldReplace) {
    return {
      action: "kept" as const,
      record: {
        ...incoming,
        completedAt: existing.completedAt,
        id: randomBytes(16).toString("hex"),
        isWin: existing.isWin,
        stars: existing.stars,
        swapsUsed: existing.swapsUsed,
        totalTime: existing.totalTime,
        updatedAt: existing.updatedAt,
      },
    };
  }

  return {
    action: "updated" as const,
    record: incoming,
  };
}

export async function getWaffleDailySession(
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
        puzzle_id,
        current_letters_json,
        swaps_used,
        max_swaps,
        total_time,
        completed,
        is_win,
        revealed,
        updated_at
      FROM waffle_daily_sessions
      WHERE user_id = ?
        AND challenge_date = ?
        AND challenge_version = ?
      LIMIT 1
    `,
    args: [userId, challengeDate, challengeVersion],
  });

  const row = result.rows[0];
  return row ? mapWaffleDailySession(row as Record<string, unknown>) : null;
}

export async function getWaffleDailyRecord(
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
        puzzle_id,
        is_win,
        swaps_used,
        max_swaps,
        stars,
        total_time,
        completed_at,
        updated_at
      FROM waffle_daily_records
      WHERE user_id = ?
        AND challenge_date = ?
        AND challenge_version = ?
      LIMIT 1
    `,
    args: [userId, challengeDate, challengeVersion],
  });

  const row = result.rows[0];
  return row ? mapWaffleDailyRecord(row as Record<string, unknown>) : null;
}

export async function getWaffleDailyStats(
  client: Client,
  userId: string,
  challengeDate: string,
  challengeVersion: string,
): Promise<WaffleDailyStats> {
  const result = await client.execute({
    sql: `
      SELECT
        challenge_date,
        challenge_version,
        challenge_sequence,
        puzzle_id,
        is_win,
        swaps_used,
        max_swaps,
        stars,
        total_time,
        completed_at,
        updated_at
      FROM waffle_daily_records
      WHERE user_id = ?
        AND challenge_version = ?
        AND challenge_date <= ?
      ORDER BY challenge_date ASC
    `,
    args: [userId, challengeVersion, challengeDate],
  });

  const records = result.rows.map((row) => mapWaffleDailyRecord(row as Record<string, unknown>));
  const todayRecord = records.find((record) => record.challengeDate === challengeDate) ?? null;
  const winningRecords = records.filter((record) => record.isWin);
  const bestWinRecord = winningRecords.reduce<WaffleDailyRecord | null>((bestRecord, record) => {
    if (!bestRecord) {
      return record;
    }

    if (record.stars > bestRecord.stars) {
      return record;
    }

    if (record.stars === bestRecord.stars && record.swapsUsed < bestRecord.swapsUsed) {
      return record;
    }

    if (
      record.stars === bestRecord.stars &&
      record.swapsUsed === bestRecord.swapsUsed &&
      record.totalTime < bestRecord.totalTime
    ) {
      return record;
    }

    return bestRecord;
  }, null);

  let maxStreak = 0;
  let runningStreak = 0;

  for (const [index, record] of records.entries()) {
    if (index === 0) {
      runningStreak = 1;
    } else {
      const previousRecord = records[index - 1];
      runningStreak =
        previousRecord && isPreviousUtcDate(previousRecord.challengeDate, record.challengeDate)
          ? runningStreak + 1
          : 1;
    }

    if (runningStreak > maxStreak) {
      maxStreak = runningStreak;
    }
  }

  let currentStreak = 0;
  const recentHistory = await getRecentWaffleDailyHistory(
    client,
    userId,
    challengeDate,
    challengeVersion,
  );

  if (todayRecord && challengeDate === getWaffleDateKey()) {
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

export async function getWaffleDailyCommunityStats(
  client: Client,
  challengeDate: string,
  challengeVersion: string,
): Promise<WaffleDailyCommunityStats | null> {
  const result = await client.execute({
    sql: `
      SELECT
        COUNT(*) AS total_completed,
        SUM(CASE WHEN is_win = 1 THEN 1 ELSE 0 END) AS total_wins,
        SUM(CASE WHEN is_win = 0 THEN 1 ELSE 0 END) AS failed_count,
        AVG(CASE WHEN is_win = 1 THEN stars END) AS average_stars,
        AVG(CASE WHEN is_win = 1 THEN swaps_used END) AS average_swaps_on_win,
        SUM(CASE WHEN is_win = 1 AND stars = 0 THEN 1 ELSE 0 END) AS wins_with_0_stars,
        SUM(CASE WHEN is_win = 1 AND stars = 1 THEN 1 ELSE 0 END) AS wins_with_1_star,
        SUM(CASE WHEN is_win = 1 AND stars = 2 THEN 1 ELSE 0 END) AS wins_with_2_stars,
        SUM(CASE WHEN is_win = 1 AND stars = 3 THEN 1 ELSE 0 END) AS wins_with_3_stars,
        SUM(CASE WHEN is_win = 1 AND stars = 4 THEN 1 ELSE 0 END) AS wins_with_4_stars,
        SUM(CASE WHEN is_win = 1 AND stars = 5 THEN 1 ELSE 0 END) AS wins_with_5_stars
      FROM waffle_daily_records
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
    return null;
  }

  return {
    challengeDate,
    totalCompleted,
    totalWins: Number(row.total_wins ?? 0),
    failedCount: Number(row.failed_count ?? 0),
    averageStars: Number(row.average_stars ?? 0),
    averageSwapsOnWin: Number(row.average_swaps_on_win ?? 0),
    starDistribution: [
      Number(row.wins_with_0_stars ?? 0),
      Number(row.wins_with_1_star ?? 0),
      Number(row.wins_with_2_stars ?? 0),
      Number(row.wins_with_3_stars ?? 0),
      Number(row.wins_with_4_stars ?? 0),
      Number(row.wins_with_5_stars ?? 0),
    ],
  };
}

export async function upsertWaffleDailySession(
  client: Client,
  input: WaffleSessionInput,
) {
  const now = new Date().toISOString();

  await client.execute({
    sql: `
      INSERT INTO waffle_daily_sessions (
        id,
        user_id,
        challenge_date,
        challenge_version,
        challenge_sequence,
        puzzle_id,
        current_letters_json,
        swaps_used,
        max_swaps,
        total_time,
        completed,
        is_win,
        revealed,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, challenge_date, challenge_version) DO UPDATE SET
        challenge_sequence = excluded.challenge_sequence,
        puzzle_id = excluded.puzzle_id,
        current_letters_json = excluded.current_letters_json,
        swaps_used = excluded.swaps_used,
        max_swaps = excluded.max_swaps,
        total_time = excluded.total_time,
        completed = excluded.completed,
        is_win = excluded.is_win,
        revealed = excluded.revealed,
        updated_at = excluded.updated_at
    `,
    args: [
      randomBytes(16).toString("hex"),
      input.userId,
      input.challengeDate,
      input.challengeVersion,
      input.challengeSequence,
      input.puzzleId,
      JSON.stringify(input.currentLetters),
      input.swapsUsed,
      input.maxSwaps,
      input.totalTime,
      input.completed ? 1 : 0,
      input.isWin === null ? null : input.isWin ? 1 : 0,
      input.revealed ? 1 : 0,
      now,
    ],
  });

  return buildWaffleDailySession(input, now);
}

export async function saveWaffleDailyRecord(
  client: Client,
  input: WaffleRecordInput,
) {
  const existing = await getWaffleDailyRecord(
    client,
    input.userId,
    input.challengeDate,
    input.challengeVersion,
  );
  const now = new Date().toISOString();
  const incoming: PersistedWaffleRecord = {
    ...input,
    completedAt: now,
    id: randomBytes(16).toString("hex"),
    updatedAt: now,
  };
  const selection = choosePreferredWaffleRecord(existing, incoming);
  const persisted = selection.record;

  await client.execute({
    sql: `
      INSERT INTO waffle_daily_records (
        id,
        user_id,
        challenge_date,
        challenge_version,
        challenge_sequence,
        puzzle_id,
        is_win,
        swaps_used,
        max_swaps,
        stars,
        total_time,
        completed_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, challenge_date, challenge_version) DO UPDATE SET
        challenge_sequence = excluded.challenge_sequence,
        puzzle_id = excluded.puzzle_id,
        is_win = excluded.is_win,
        swaps_used = excluded.swaps_used,
        max_swaps = excluded.max_swaps,
        stars = excluded.stars,
        total_time = excluded.total_time,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
    `,
    args: [
      persisted.id,
      persisted.userId,
      persisted.challengeDate,
      persisted.challengeVersion,
      persisted.challengeSequence,
      persisted.puzzleId,
      persisted.isWin ? 1 : 0,
      persisted.swapsUsed,
      persisted.maxSwaps,
      persisted.stars,
      persisted.totalTime,
      persisted.completedAt,
      now,
    ],
  });

  return {
    action: selection.action,
    record: buildWaffleDailyRecord(persisted),
  };
}
