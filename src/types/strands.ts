export interface StrandsWordHint {
  word: string;
  hint: string;
}

export interface StrandsArticleDb {
  slug: string;
  title: string;
  intro: string;
  themeAnalysis: string;
  spangramHint: string;
  wordHints: StrandsWordHint[];
  outro: string;
}

export interface StrandsPuzzleData {
  date: string; // 'YYYY-MM-DD'（UTC）；练习模式为 'practice_<epochMillis>'
  puzzle: {
    id: string; // 谜题 id；练习模式加前缀 'practice_'
    theme: string;
    spangram: string;
    words: string[];
    validWords: string[];
    grid: string[][]; // 8 行 × 6 列，grid[row][col]
    article?: StrandsArticleDb | null;
  };
}

export interface StrandsPoint {
  r: number;
  c: number;
}

export interface FoundWord {
  word: string; // canonical 形式（正序，大写）
  path: StrandsPoint[];
  isSpangram: boolean;
}

export type InteractionMode = "idle" | "dragging" | "clicking";

export interface SavedStrandsState {
  date: string;
  foundWords: FoundWord[];
  hintMeter: number;
  totalHintsUsed: number;
  scoreSubmitted?: boolean;
  chargedWords?: string[];
  hintCells?: StrandsPoint[];
}

export interface StrandsStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  perfectGames: number;
  lastPlayedDate?: string; // 'YYYY-MM-DD'
  lastWonDate?: string;
}
