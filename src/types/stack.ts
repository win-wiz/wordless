export type StackPuzzleDifficulty = "easy" | "medium" | "hard";

export type StackPuzzleStatus = "draft" | "active" | "archived";

export type StackPuzzleSource = "manual" | "generated" | "hybrid";

export type StackPuzzleWordRole = "opening" | "middle" | "closing";

export type StackTilePayload = {
  blockerTileIds: string[];
  char: string;
  charIndex: number;
  depth: number;
  id: string;
  layerIndex: number;
  puzzleWordId: string;
};

export type StackPuzzleWordPayload = {
  clue: string;
  id: string;
  orderIndex: number;
  role: StackPuzzleWordRole;
  tileIds: string[];
  word: string;
  wordId: string;
};

export type StackPuzzlePayload = {
  difficulty: StackPuzzleDifficulty;
  id: string;
  slug: string;
  source: StackPuzzleSource;
  status: StackPuzzleStatus;
  tileCount: number;
  title: string | null;
  version: string;
  wordCount: number;
  words: StackPuzzleWordPayload[];
  tiles: StackTilePayload[];
};
