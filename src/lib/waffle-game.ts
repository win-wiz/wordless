export const WAFFLE_BOARD_SIZE = 5;
export const WAFFLE_TILE_COUNT = 21;
export const WAFFLE_PAR_SWAPS = 10;
export const WAFFLE_MAX_SWAPS = 15;

export type WaffleTileState = "green" | "yellow" | "gray";

export type WaffleDifficulty = "easy" | "medium" | "hard";

export type WafflePlayableCell = {
  col: number;
  colSlot: number | null;
  index: number;
  row: number;
  rowSlot: number | null;
};

export type WafflePuzzlePayload = {
  cycleSizes: number[];
  difficulty: WaffleDifficulty;
  greenTiles: number;
  horizontalWords: string[];
  id: string;
  initialLetters: string[];
  maxSwaps: number;
  parSwaps: number;
  puzzleScore: number;
  solutionLetters: string[];
  tileCount: number;
  verticalWords: string[];
};

const PLAYABLE_CELLS: WafflePlayableCell[] = [];
const PLAYABLE_INDEX_SET = new Set<number>();

for (let row = 0; row < WAFFLE_BOARD_SIZE; row += 1) {
  for (let col = 0; col < WAFFLE_BOARD_SIZE; col += 1) {
    if (row % 2 === 1 && col % 2 === 1) {
      continue;
    }

    const index = PLAYABLE_CELLS.length;
    PLAYABLE_CELLS.push({
      col,
      colSlot: col % 2 === 0 ? col / 2 : null,
      index,
      row,
      rowSlot: row % 2 === 0 ? row / 2 : null,
    });
    PLAYABLE_INDEX_SET.add(index);
  }
}

export function getPlayableCells() {
  return PLAYABLE_CELLS;
}

export function isPlayableCellIndex(index: number) {
  return PLAYABLE_INDEX_SET.has(index);
}

export function buildWaffleSolutionLetters(horizontalWords: string[], verticalWords: string[]) {
  if (horizontalWords.length !== 3 || verticalWords.length !== 3) {
    throw new Error("Waffle requires exactly three horizontal words and three vertical words.");
  }

  const normalizedAcross = horizontalWords.map((word) => word.toLowerCase());
  const normalizedDown = verticalWords.map((word) => word.toLowerCase());

  for (const word of [...normalizedAcross, ...normalizedDown]) {
    if (!/^[a-z]{5}$/.test(word)) {
      throw new Error(`Invalid waffle word: ${word}`);
    }
  }

  const letters: string[] = new Array(WAFFLE_TILE_COUNT);

  for (const cell of PLAYABLE_CELLS) {
    const rowWord = cell.rowSlot === null ? null : normalizedAcross[cell.rowSlot];
    const colWord = cell.colSlot === null ? null : normalizedDown[cell.colSlot];

    const rowLetter = rowWord ? rowWord[cell.col] : null;
    const colLetter = colWord ? colWord[cell.row] : null;

    if (rowLetter && colLetter && rowLetter !== colLetter) {
      throw new Error(
        `Waffle intersection mismatch at row=${cell.row} col=${cell.col}: ${rowLetter} !== ${colLetter}`,
      );
    }

    letters[cell.index] = rowLetter ?? colLetter ?? "";
  }

  return letters;
}

function getWordIndicesForRow(rowSlot: number) {
  return PLAYABLE_CELLS.filter((cell) => cell.rowSlot === rowSlot).map((cell) => cell.index);
}

function getWordIndicesForColumn(colSlot: number) {
  return PLAYABLE_CELLS.filter((cell) => cell.colSlot === colSlot).map((cell) => cell.index);
}

function getWordleStates(currentWord: string, solutionWord: string): WaffleTileState[] {
  const states = new Array<WaffleTileState>(solutionWord.length).fill("gray");
  const remaining = new Map<string, number>();

  for (let index = 0; index < solutionWord.length; index += 1) {
    if (currentWord[index] === solutionWord[index]) {
      states[index] = "green";
      continue;
    }

    const letter = solutionWord[index]!;
    remaining.set(letter, (remaining.get(letter) ?? 0) + 1);
  }

  for (let index = 0; index < currentWord.length; index += 1) {
    if (states[index] === "green") {
      continue;
    }

    const letter = currentWord[index]!;
    const count = remaining.get(letter) ?? 0;

    if (count > 0) {
      states[index] = "yellow";
      remaining.set(letter, count - 1);
    }
  }

  return states;
}

export function buildWordsFromLetters(letters: string[]) {
  if (letters.length !== WAFFLE_TILE_COUNT) {
    throw new Error(`Expected ${WAFFLE_TILE_COUNT} letters, received ${letters.length}.`);
  }

  const horizontalWords = [0, 1, 2].map((rowSlot) =>
    getWordIndicesForRow(rowSlot)
      .map((index) => letters[index] ?? "")
      .join(""),
  );
  const verticalWords = [0, 1, 2].map((colSlot) =>
    getWordIndicesForColumn(colSlot)
      .map((index) => letters[index] ?? "")
      .join(""),
  );

  return {
    horizontalWords,
    verticalWords,
  };
}

export function evaluateWaffleBoard(currentLetters: string[], solutionLetters: string[]) {
  if (currentLetters.length !== WAFFLE_TILE_COUNT || solutionLetters.length !== WAFFLE_TILE_COUNT) {
    throw new Error("Waffle board evaluation requires 21 playable letters.");
  }

  const currentWords = buildWordsFromLetters(currentLetters);
  const solutionWords = buildWordsFromLetters(solutionLetters);
  const rowStates = [0, 1, 2].map((rowSlot) =>
    getWordleStates(currentWords.horizontalWords[rowSlot]!, solutionWords.horizontalWords[rowSlot]!),
  );
  const columnStates = [0, 1, 2].map((colSlot) =>
    getWordleStates(currentWords.verticalWords[colSlot]!, solutionWords.verticalWords[colSlot]!),
  );

  return PLAYABLE_CELLS.map((cell) => {
    if (currentLetters[cell.index] === solutionLetters[cell.index]) {
      return "green";
    }

    const rowState = cell.rowSlot === null ? null : rowStates[cell.rowSlot]?.[cell.col];
    const columnState = cell.colSlot === null ? null : columnStates[cell.colSlot]?.[cell.row];

    if (rowState === "yellow" || columnState === "yellow") {
      return "yellow";
    }

    return "gray";
  });
}

export function swapWaffleLetters(letters: string[], fromIndex: number, toIndex: number) {
  if (!isPlayableCellIndex(fromIndex) || !isPlayableCellIndex(toIndex)) {
    throw new Error("Can only swap playable waffle cells.");
  }

  if (fromIndex === toIndex) {
    return [...letters];
  }

  const nextLetters = [...letters];
  const temp = nextLetters[fromIndex];
  nextLetters[fromIndex] = nextLetters[toIndex]!;
  nextLetters[toIndex] = temp!;
  return nextLetters;
}

export function isWaffleSolved(currentLetters: string[], solutionLetters: string[]) {
  return currentLetters.every((letter, index) => letter === solutionLetters[index]);
}

export function countSolvedTiles(currentLetters: string[], solutionLetters: string[]) {
  return currentLetters.filter((letter, index) => letter === solutionLetters[index]).length;
}

export function countRemainingSwaps(swapsUsed: number, maxSwaps = WAFFLE_MAX_SWAPS) {
  return Math.max(0, maxSwaps - swapsUsed);
}

export function countWaffleStars(swapsUsed: number, maxSwaps = WAFFLE_MAX_SWAPS) {
  return Math.max(0, Math.min(5, countRemainingSwaps(swapsUsed, maxSwaps)));
}

export function buildWaffleEmojiBoard(tileStates: WaffleTileState[]) {
  if (tileStates.length !== WAFFLE_TILE_COUNT) {
    throw new Error("Waffle emoji board requires 21 tile states.");
  }

  const stateByCoordinate = new Map<string, WaffleTileState>();

  PLAYABLE_CELLS.forEach((cell) => {
    stateByCoordinate.set(`${cell.row}-${cell.col}`, tileStates[cell.index] ?? "gray");
  });

  const rows = Array.from({ length: WAFFLE_BOARD_SIZE }, (_, row) =>
    Array.from({ length: WAFFLE_BOARD_SIZE }, (_, col) => {
      const state = stateByCoordinate.get(`${row}-${col}`);

      if (!state) {
        return "⬛";
      }

      if (state === "green") {
        return "🟩";
      }

      if (state === "yellow") {
        return "🟨";
      }

      return "⬜";
    }).join(""),
  );

  return rows.join("\n");
}

export function buildWaffleShareText({
  details,
  emojiBoard,
  sequence,
  solved,
  stars,
  url,
}: {
  details?: string[];
  emojiBoard: string;
  sequence: number | null;
  solved: boolean;
  stars: number;
  url: string;
}) {
  const shareScore = solved ? `${stars}/5` : "X/5";
  const shareId = sequence ? `#waffle${sequence}` : "#waffle";
  const detailBlock = details && details.length > 0 ? `\n\n${details.join("\n")}` : "";

  return `${shareId} ${shareScore}\n\n${emojiBoard}${detailBlock}\n\n${url}`;
}
