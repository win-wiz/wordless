import type { Client } from "@libsql/client";

import type { WafflePuzzlePayload } from "@/lib/waffle-game";
import {
  WAFFLE_BOARD_SIZE,
  WAFFLE_MAX_SWAPS,
  WAFFLE_PAR_SWAPS,
  WAFFLE_TILE_COUNT,
} from "@/lib/waffle-game";

export const WAFFLE_DAILY_SCHEDULE_VERSION = "v1";
export const WAFFLE_DAILY_TIMEZONE = "UTC";

export type WaffleScheduledPuzzle = WafflePuzzlePayload & {
  date: string | null;
  mode: "daily" | "unlimited";
  sequence: number | null;
  status: string | null;
  version: string | null;
};

function parseJsonStringArray(value: unknown, label: string) {
  const parsed = JSON.parse(String(value ?? "[]"));

  if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) {
    throw new Error(`Invalid ${label} payload stored in database.`);
  }

  return parsed;
}

function parseJsonNumberArray(value: unknown, label: string) {
  const parsed = JSON.parse(String(value ?? "[]"));

  if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "number")) {
    throw new Error(`Invalid ${label} payload stored in database.`);
  }

  return parsed;
}

function mapPuzzleRow(row: Record<string, unknown>): WafflePuzzlePayload {
  return {
    cycleSizes: parseJsonNumberArray(row.cycle_sizes_json, "waffle cycle sizes"),
    difficulty: String(row.difficulty) as WafflePuzzlePayload["difficulty"],
    greenTiles: Number(row.green_tiles ?? 0),
    horizontalWords: parseJsonStringArray(row.horizontal_words_json, "waffle across words"),
    id: String(row.puzzle_id),
    initialLetters: parseJsonStringArray(row.initial_letters_json, "waffle initial letters"),
    maxSwaps: Number(row.max_swaps ?? WAFFLE_MAX_SWAPS),
    parSwaps: Number(row.par_swaps ?? WAFFLE_PAR_SWAPS),
    puzzleScore: Number(row.puzzle_score ?? 0),
    solutionLetters: parseJsonStringArray(row.solution_letters_json, "waffle solution letters"),
    tileCount: Number(row.tile_count ?? WAFFLE_TILE_COUNT),
    verticalWords: parseJsonStringArray(row.vertical_words_json, "waffle down words"),
  };
}

export function getWaffleDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function mapScheduledPuzzle(row: Record<string, unknown>, mode: "daily" | "unlimited") {
  const puzzle = mapPuzzleRow(row);

  return {
    ...puzzle,
    date: row.challenge_date ? String(row.challenge_date) : null,
    mode,
    sequence: row.sequence === undefined || row.sequence === null ? null : Number(row.sequence),
    status: row.status ? String(row.status) : null,
    version: row.version ? String(row.version) : null,
  } satisfies WaffleScheduledPuzzle;
}

export async function getWaffleDailyPuzzle(
  client: Client,
  dateKey = getWaffleDateKey(),
  version = WAFFLE_DAILY_SCHEDULE_VERSION,
) {
  const result = await client.execute({
    sql: `
      SELECT
        wds.challenge_date,
        wds.sequence,
        wds.version,
        wds.status,
        wp.puzzle_id,
        wp.difficulty,
        wp.board_size,
        wp.tile_count,
        wp.par_swaps,
        wp.max_swaps,
        wp.green_tiles,
        wp.puzzle_score,
        wp.horizontal_words_json,
        wp.vertical_words_json,
        wp.solution_letters_json,
        wp.initial_letters_json,
        wp.cycle_sizes_json
      FROM waffle_daily_schedule wds
      JOIN waffle_puzzles wp ON wp.puzzle_id = wds.puzzle_id
      WHERE wds.challenge_date = ?
        AND wds.version = ?
      LIMIT 1
    `,
    args: [dateKey, version],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapScheduledPuzzle(row, "daily") : null;
}

export async function getRandomWafflePuzzle(client: Client) {
  const result = await client.execute({
    sql: `
      SELECT
        puzzle_id,
        difficulty,
        board_size,
        tile_count,
        par_swaps,
        max_swaps,
        green_tiles,
        puzzle_score,
        horizontal_words_json,
        vertical_words_json,
        solution_letters_json,
        initial_letters_json,
        cycle_sizes_json
      FROM waffle_puzzles
      ORDER BY RANDOM()
      LIMIT 1
    `,
    args: [],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;
  return row ? mapScheduledPuzzle(row, "unlimited") : null;
}

export async function getWaffleDailyScheduleRange(
  client: Client,
  version = WAFFLE_DAILY_SCHEDULE_VERSION,
) {
  const result = await client.execute({
    sql: `
      SELECT
        MIN(challenge_date) AS start_date,
        MAX(challenge_date) AS end_date,
        COUNT(*) AS total_days
      FROM waffle_daily_schedule
      WHERE version = ?
    `,
    args: [version],
  });

  const row = result.rows[0] as Record<string, unknown> | undefined;

  return {
    endDate: row?.end_date ? String(row.end_date) : null,
    startDate: row?.start_date ? String(row.start_date) : null,
    totalDays: Number(row?.total_days ?? 0),
  };
}

export function assertValidWafflePayload(puzzle: WafflePuzzlePayload) {
  if (puzzle.tileCount !== WAFFLE_TILE_COUNT) {
    throw new Error(`Unexpected waffle tile count: ${puzzle.tileCount}`);
  }

  if (puzzle.initialLetters.length !== WAFFLE_TILE_COUNT || puzzle.solutionLetters.length !== WAFFLE_TILE_COUNT) {
    throw new Error("Waffle puzzle letters are malformed.");
  }

  if (puzzle.horizontalWords.length !== 3 || puzzle.verticalWords.length !== 3) {
    throw new Error("Waffle puzzle words are malformed.");
  }

  if (puzzle.parSwaps !== WAFFLE_PAR_SWAPS || puzzle.maxSwaps !== WAFFLE_MAX_SWAPS) {
    throw new Error("Waffle puzzle swap budget is malformed.");
  }

  return {
    ...puzzle,
    boardSize: WAFFLE_BOARD_SIZE,
  };
}
