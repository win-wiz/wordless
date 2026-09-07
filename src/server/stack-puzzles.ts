import type { Client } from "@libsql/client";

import type { StackPuzzlePayload, StackPuzzleWordPayload } from "@/types/stack";

function mapPuzzleWordRows(rows: Array<Record<string, unknown>>) {
  const words: StackPuzzleWordPayload[] = rows.map((row) => ({
    clue: String(row.clue ?? "Clue pending"),
    id: String(row.puzzle_word_id),
    orderIndex: Number(row.order_index ?? 0),
    role: String(row.role ?? "middle") as StackPuzzleWordPayload["role"],
    tileIds: [],
    word: String(row.word),
    wordId: String(row.word_id),
  }));

  words.sort((left, right) => left.orderIndex - right.orderIndex || left.id.localeCompare(right.id));
  return words;
}

export async function getRandomStackPuzzle(client: Client) {
  const puzzleResult = await client.execute(`
    SELECT
      puzzle_id,
      slug,
      version,
      title,
      difficulty,
      word_count,
      tile_count,
      status,
      source
    FROM stack_puzzles
    WHERE status IN ('draft', 'active')
    ORDER BY RANDOM()
    LIMIT 1
  `);

  const puzzleRow = puzzleResult.rows[0] as Record<string, unknown> | undefined;

  if (!puzzleRow) {
    return null;
  }

  const puzzleId = String(puzzleRow.puzzle_id);
  const wordResult = await client.execute({
    sql: `
      SELECT
        spw.puzzle_word_id,
        spw.word_id,
        spw.order_index,
        spw.role,
        COALESCE(NULLIF(spw.clue_override, ''), NULLIF(sw.default_clue, ''), 'Clue pending') AS clue,
        sw.word
      FROM stack_puzzle_words spw
      JOIN stack_words sw ON sw.word_id = spw.word_id
      WHERE spw.puzzle_id = ?
      ORDER BY spw.order_index ASC
    `,
    args: [puzzleId],
  });
  const tileResult = await client.execute({
    sql: `
      SELECT
        tile_id,
        puzzle_word_id,
        char,
        char_index,
        depth,
        layer_index
      FROM stack_puzzle_tiles
      WHERE puzzle_id = ?
      ORDER BY depth ASC, layer_index ASC, char_index ASC
    `,
    args: [puzzleId],
  });
  const blockerResult = await client.execute({
    sql: `
      SELECT
        tile_id,
        blocker_tile_id
      FROM stack_tile_blockers
      WHERE puzzle_id = ?
      ORDER BY tile_id ASC, blocker_tile_id ASC
    `,
    args: [puzzleId],
  });

  const words = mapPuzzleWordRows(wordResult.rows as Array<Record<string, unknown>>);
  const wordByPuzzleWordId = new Map(words.map((word) => [word.id, word]));
  const blockerMap = new Map<string, string[]>();

  for (const row of blockerResult.rows as Array<Record<string, unknown>>) {
    const tileId = String(row.tile_id);
    const blockers = blockerMap.get(tileId) ?? [];
    blockers.push(String(row.blocker_tile_id));
    blockerMap.set(tileId, blockers);
  }

  const tiles = (tileResult.rows as Array<Record<string, unknown>>).map((row) => {
    const tile = {
      blockerTileIds: blockerMap.get(String(row.tile_id)) ?? [],
      char: String(row.char),
      charIndex: Number(row.char_index ?? 0),
      depth: Number(row.depth ?? 0),
      id: String(row.tile_id),
      layerIndex: Number(row.layer_index ?? 0),
      puzzleWordId: String(row.puzzle_word_id),
    };
    const word = wordByPuzzleWordId.get(tile.puzzleWordId);

    if (word) {
      word.tileIds.push(tile.id);
    }

    return tile;
  });
  const tileById = new Map(tiles.map((tile) => [tile.id, tile]));

  for (const word of words) {
    word.tileIds.sort((left, right) => {
      const leftTile = tileById.get(left);
      const rightTile = tileById.get(right);

      return (
        Number(leftTile?.charIndex ?? 0) - Number(rightTile?.charIndex ?? 0) ||
        left.localeCompare(right)
      );
    });
  }

  const puzzle: StackPuzzlePayload = {
    difficulty: String(puzzleRow.difficulty) as StackPuzzlePayload["difficulty"],
    id: puzzleId,
    slug: String(puzzleRow.slug),
    source: String(puzzleRow.source) as StackPuzzlePayload["source"],
    status: String(puzzleRow.status) as StackPuzzlePayload["status"],
    tileCount: Number(puzzleRow.tile_count ?? tiles.length),
    title: puzzleRow.title ? String(puzzleRow.title) : null,
    version: String(puzzleRow.version ?? "v1"),
    wordCount: Number(puzzleRow.word_count ?? words.length),
    words,
    tiles,
  };

  return puzzle;
}
