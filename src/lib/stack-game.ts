import type {
  StackPuzzlePayload,
  StackPuzzleWordPayload,
  StackTilePayload,
} from "@/types/stack";

export type StackSubmitResult =
  | {
      kind: "incomplete";
      nextRemovedTileIds: string[];
      nextSelectedTileIds: string[];
      solvedWord: null;
    }
  | {
      kind: "invalid";
      nextRemovedTileIds: string[];
      nextSelectedTileIds: string[];
      solvedWord: null;
    }
  | {
      kind: "solved";
      nextRemovedTileIds: string[];
      nextSelectedTileIds: string[];
      solvedWord: StackPuzzleWordPayload;
    };

export function getTileById(puzzle: StackPuzzlePayload, tileId: string) {
  return puzzle.tiles.find((tile) => tile.id === tileId) ?? null;
}

export function getWordByPuzzleWordId(
  puzzle: StackPuzzlePayload,
  puzzleWordId: string,
) {
  return puzzle.words.find((word) => word.id === puzzleWordId) ?? null;
}

export function getRemovedTileIdSet(removedTileIds: string[]) {
  return new Set(removedTileIds);
}

export function buildRemovedTileIdsFromClearedWords(
  puzzle: StackPuzzlePayload,
  clearedWordIds: string[],
) {
  const removedTileIds: string[] = [];
  const seenTileIds = new Set<string>();

  for (const wordId of clearedWordIds) {
    const word = puzzle.words.find((entry) => entry.id === wordId);

    if (!word) {
      continue;
    }

    for (const tileId of word.tileIds) {
      if (seenTileIds.has(tileId)) {
        continue;
      }

      seenTileIds.add(tileId);
      removedTileIds.push(tileId);
    }
  }

  return removedTileIds;
}

export function getExposedTiles(
  puzzle: StackPuzzlePayload,
  removedTileIds: string[],
) {
  const removedTileIdSet = getRemovedTileIdSet(removedTileIds);

  return puzzle.tiles.filter(
    (tile) =>
      !removedTileIdSet.has(tile.id) &&
      tile.blockerTileIds.every((blockerTileId) =>
        removedTileIdSet.has(blockerTileId),
      ),
  );
}

export function getSolvableWords(
  puzzle: StackPuzzlePayload,
  removedTileIds: string[],
) {
  const exposedTileIds = new Set(
    getExposedTiles(puzzle, removedTileIds).map((tile) => tile.id),
  );
  const removedTileIdSet = getRemovedTileIdSet(removedTileIds);

  return puzzle.words.filter(
    (word) =>
      word.tileIds.every(
        (tileId) => removedTileIdSet.has(tileId) || exposedTileIds.has(tileId),
      ) && word.tileIds.some((tileId) => !removedTileIdSet.has(tileId)),
  );
}

export function getSelectedTiles(
  puzzle: StackPuzzlePayload,
  selectedTileIds: string[],
) {
  return selectedTileIds
    .map((tileId) => getTileById(puzzle, tileId))
    .filter((tile): tile is StackTilePayload => Boolean(tile));
}

export function buildSelectedWord(
  puzzle: StackPuzzlePayload,
  selectedTileIds: string[],
) {
  return getSelectedTiles(puzzle, selectedTileIds)
    .map((tile) => tile.char)
    .join("");
}

export function toggleSelectedTile(
  puzzle: StackPuzzlePayload,
  selectedTileIds: string[],
  tileId: string,
  removedTileIds: string[],
) {
  const tile = getTileById(puzzle, tileId);

  if (!tile) {
    return selectedTileIds;
  }

  const activeHiddenTileIds = [...removedTileIds, ...selectedTileIds];
  const exposedTileIds = new Set(
    getExposedTiles(puzzle, activeHiddenTileIds).map((entry) => entry.id),
  );

  if (!exposedTileIds.has(tileId)) {
    return selectedTileIds;
  }

  if (selectedTileIds.includes(tileId) || selectedTileIds.length >= 5) {
    return selectedTileIds;
  }

  return [...selectedTileIds, tileId];
}

export function clearSelectedTileIds() {
  return [] as string[];
}

export function trimSelectedTileIds(selectedTileIds: string[], tileId: string) {
  const selectedTileIndex = selectedTileIds.indexOf(tileId);

  if (selectedTileIndex < 0) {
    return selectedTileIds;
  }

  return selectedTileIds.slice(0, selectedTileIndex);
}

export function isPuzzleSolved(
  puzzle: StackPuzzlePayload,
  removedTileIds: string[],
) {
  const removedTileIdSet = getRemovedTileIdSet(removedTileIds);
  return puzzle.tiles.every((tile) => removedTileIdSet.has(tile.id));
}

export function submitSelectedTiles(
  puzzle: StackPuzzlePayload,
  selectedTileIds: string[],
  removedTileIds: string[],
): StackSubmitResult {
  if (selectedTileIds.length !== 5) {
    return {
      kind: "incomplete",
      nextRemovedTileIds: removedTileIds,
      nextSelectedTileIds: clearSelectedTileIds(),
      solvedWord: null,
    };
  }

  const solvableWords = getSolvableWords(puzzle, removedTileIds);
  const matchedWord =
    solvableWords.find(
      (word) =>
        word.tileIds.length === selectedTileIds.length &&
        word.tileIds.every(
          (tileId, index) => tileId === selectedTileIds[index],
        ),
    ) ?? null;

  if (!matchedWord) {
    return {
      kind: "invalid",
      nextRemovedTileIds: removedTileIds,
      nextSelectedTileIds: clearSelectedTileIds(),
      solvedWord: null,
    };
  }

  return {
    kind: "solved",
    nextRemovedTileIds: [...removedTileIds, ...matchedWord.tileIds],
    nextSelectedTileIds: clearSelectedTileIds(),
    solvedWord: matchedWord,
  };
}
