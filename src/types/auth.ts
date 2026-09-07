import type { EvaluatedLetterState } from "@/lib/game-state";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export type AuthSessionUser = {
  email: string;
  displayName: string;
  image?: string | null;
  id?: string;
  createdAt?: string;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  user: AuthSessionUser | null;
};

export type DailyChallengeRecord = {
  challengeDate: string;
  challengeVersion: string;
  challengeSequence: number;
  answerWord: string;
  wordLength: number;
  isWin: boolean;
  attempts: number;
  maxAttempts: number;
  totalTime: number;
  pattern: string | null;
  completedAt: string;
  updatedAt: string;
};

export type DailyChallengeHistoryEntry = {
  date: string;
  sequence: number;
  completed: boolean;
  isWin: boolean | null;
  attempts: number | null;
  totalTime: number | null;
  isToday: boolean;
};

export type DailyChallengeSession = {
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
  solutionWord: string | null;
  updatedAt: string;
};

export type DailyChallengeRecordResponse = {
  authenticated: boolean;
  record: DailyChallengeRecord | null;
  session: DailyChallengeSession | null;
};

export type DailyChallengeStats = {
  completedToday: boolean;
  todayRecord: DailyChallengeRecord | null;
  bestWinRecord: DailyChallengeRecord | null;
  currentStreak: number;
  maxStreak: number;
  totalCompleted: number;
  totalWins: number;
  recentHistory: DailyChallengeHistoryEntry[];
};

export type DailyChallengeCommunityStats = {
  challengeDate: string;
  totalCompleted: number;
  totalWins: number;
  failedCount: number;
  guessDistribution: number[];
};

export type DailyChallengeProgressResponse = {
  authenticated: boolean;
  communityStats: DailyChallengeCommunityStats | null;
  record: DailyChallengeRecord | null;
  stats: DailyChallengeStats | null;
  session: DailyChallengeSession | null;
};

export type SaveDailyChallengeRecordPayload = {
  completionToken: string;
  pattern?: string;
};

export type SaveDailyChallengeRecordResponse = {
  authenticated: boolean;
  record: DailyChallengeRecord | null;
  session: DailyChallengeSession | null;
  action: 'inserted' | 'updated' | 'kept';
};
