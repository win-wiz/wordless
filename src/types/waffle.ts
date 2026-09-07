export type WaffleDailyRecord = {
  challengeDate: string;
  challengeVersion: string;
  challengeSequence: number;
  puzzleId: string;
  isWin: boolean;
  swapsUsed: number;
  maxSwaps: number;
  stars: number;
  totalTime: number;
  completedAt: string;
  updatedAt: string;
};

export type WaffleDailyHistoryEntry = {
  date: string;
  sequence: number;
  completed: boolean;
  isWin: boolean | null;
  stars: number | null;
  swapsUsed: number | null;
  totalTime: number | null;
  isToday: boolean;
};

export type WaffleDailySession = {
  challengeDate: string;
  challengeVersion: string;
  challengeSequence: number;
  puzzleId: string;
  currentLetters: string[];
  swapsUsed: number;
  maxSwaps: number;
  totalTime: number;
  completed: boolean;
  isWin: boolean | null;
  revealed: boolean;
  updatedAt: string;
};

export type WaffleDailyStats = {
  completedToday: boolean;
  todayRecord: WaffleDailyRecord | null;
  bestWinRecord: WaffleDailyRecord | null;
  currentStreak: number;
  maxStreak: number;
  totalCompleted: number;
  totalWins: number;
  recentHistory: WaffleDailyHistoryEntry[];
};

export type WaffleDailyCommunityStats = {
  challengeDate: string;
  totalCompleted: number;
  totalWins: number;
  failedCount: number;
  averageStars: number;
  averageSwapsOnWin: number;
  starDistribution: number[];
};

export type WaffleDailyProgressResponse = {
  authenticated: boolean;
  communityStats: WaffleDailyCommunityStats | null;
  record: WaffleDailyRecord | null;
  stats: WaffleDailyStats | null;
  session: WaffleDailySession | null;
};

export type SaveWaffleDailyProgressPayload = {
  challengeDate: string;
  currentLetters: string[];
  maxSwaps: number;
  revealed?: boolean;
  swapsUsed: number;
  totalTime: number;
};

export type SaveWaffleDailyProgressResponse = {
  action?: "inserted" | "updated" | "kept";
  authenticated: boolean;
  communityStats: WaffleDailyCommunityStats | null;
  record: WaffleDailyRecord | null;
  stats: WaffleDailyStats | null;
  session: WaffleDailySession | null;
};
