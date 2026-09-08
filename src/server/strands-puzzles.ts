import type { Client } from "@libsql/client";

import type { StrandsArticleDb, StrandsPuzzleData } from "@/types/strands";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface StrandsArchiveEntry {
  date: string;
  theme: string;
  articleSlug: string | null;
}

export interface SaveStrandsScoreInput {
  date: string;
  puzzleId: string;
  userId?: string | null;
  anonymousId?: string | null;
  hintsUsed: number;
  completed?: boolean;
}

function getStrandsDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function parseJsonStringArray(value: unknown, label: string) {
  const parsed = JSON.parse(String(value ?? "[]"));

  if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) {
    throw new Error(`Invalid ${label} payload stored in database.`);
  }

  return parsed;
}

function parseGrid(value: unknown): string[][] {
  const parsed = JSON.parse(String(value ?? "[]"));

  if (
    !Array.isArray(parsed) ||
    !parsed.every(
      (row) => Array.isArray(row) && row.every((cell) => typeof cell === "string"),
    )
  ) {
    throw new Error("Invalid strands grid payload stored in database.");
  }

  return parsed;
}

function parseArticle(value: unknown): StrandsArticleDb | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return JSON.parse(String(value)) as StrandsArticleDb;
}

function mapPuzzleRow(
  row: Record<string, unknown>,
  date: string,
): StrandsPuzzleData {
  return {
    date,
    puzzle: {
      id: String(row.id),
      theme: String(row.theme),
      spangram: String(row.spangram),
      words: parseJsonStringArray(row.words, "strands words"),
      validWords: parseJsonStringArray(row.valid_words, "strands valid words"),
      grid: parseGrid(row.grid),
      article: parseArticle(row.article),
    },
  };
}

const PUZZLE_COLUMNS = `
  sp.id,
  sp.theme,
  sp.spangram,
  sp.words,
  sp.valid_words,
  sp.grid,
  sp.article
`;

export async function getDailyStrandsPuzzle(
  client: Client,
  date?: string,
): Promise<StrandsPuzzleData | null> {
  const dateKey = date ?? getStrandsDateKey();

  if (!DATE_PATTERN.test(dateKey)) {
    return null;
  }

  const result = await client.execute({
    sql: `
      SELECT
        ds.date,
        ${PUZZLE_COLUMNS}
      FROM daily_strands ds
      JOIN strands_puzzles sp ON sp.id = ds.puzzle_id
      WHERE ds.date = ?
      LIMIT 1
    `,
    args: [dateKey],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapPuzzleRow(row, String(row.date)) : null;
}

export async function getRandomStrandsPuzzle(
  client: Client,
): Promise<StrandsPuzzleData | null> {
  const result = await client.execute({
    sql: `
      SELECT
        ${PUZZLE_COLUMNS}
      FROM strands_puzzles sp
      ORDER BY RANDOM()
      LIMIT 1
    `,
    args: [],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;

  if (!row) {
    return null;
  }

  const puzzle = mapPuzzleRow(row, `practice_${Date.now()}`);
  puzzle.puzzle.id = `practice_${puzzle.puzzle.id}`;
  return puzzle;
}

export async function getArchiveStrandsPuzzles(
  client: Client,
  limit = 50,
): Promise<StrandsArchiveEntry[]> {
  const result = await client.execute({
    sql: `
      SELECT
        ds.date,
        sp.theme,
        json_extract(sp.article, '$.slug') AS article_slug
      FROM daily_strands ds
      JOIN strands_puzzles sp ON sp.id = ds.puzzle_id
      WHERE ds.date <= ?
      ORDER BY ds.date DESC
      LIMIT ?
    `,
    args: [getStrandsDateKey(), limit],
  });

  return result.rows.map((row) => {
    const record = row as Record<string, unknown>;

    return {
      date: String(record.date),
      theme: String(record.theme),
      articleSlug:
        record.article_slug === null || record.article_slug === undefined
          ? null
          : String(record.article_slug),
    };
  });
}

export async function getStrandsPuzzleBySlug(
  client: Client,
  slug: string,
): Promise<StrandsPuzzleData | null> {
  const trimmedSlug = slug.trim();

  if (!trimmedSlug) {
    return null;
  }

  const result = await client.execute({
    sql: `
      SELECT
        ${PUZZLE_COLUMNS}
      FROM strands_puzzles sp
      WHERE json_extract(sp.article, '$.slug') = ?
      LIMIT 1
    `,
    args: [trimmedSlug],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;

  if (!row) {
    return null;
  }

  const daily = await client.execute({
    sql: `
      SELECT date
      FROM daily_strands
      WHERE puzzle_id = ?
      ORDER BY date DESC
      LIMIT 1
    `,
    args: [String(row.id)],
  });

  const dailyRow = daily.rows[0] as Record<string, unknown> | undefined;
  const date = dailyRow?.date ? String(dailyRow.date) : getStrandsDateKey();

  return mapPuzzleRow(row, date);
}

export async function saveStrandsScore(
  client: Client,
  {
    date,
    puzzleId,
    userId,
    anonymousId,
    hintsUsed,
    completed = true,
  }: SaveStrandsScoreInput,
): Promise<void> {
  await client.execute({
    sql: `
      INSERT INTO strands_scores (
        date,
        puzzle_id,
        user_id,
        anonymous_id,
        hints_used,
        completed,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      date,
      puzzleId,
      userId ?? null,
      anonymousId ?? null,
      hintsUsed,
      completed ? 1 : 0,
      new Date().toISOString(),
    ],
  });
}
