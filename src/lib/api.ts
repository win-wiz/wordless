import type {
  DailyChallengeCommunityStats,
  DailyChallengeRecord,
  DailyChallengeProgressResponse,
  DailyChallengeSession,
  SaveDailyChallengeRecordPayload,
  SaveDailyChallengeRecordResponse,
} from "@/types/auth";
import type {
  SaveWaffleDailyProgressPayload,
  SaveWaffleDailyProgressResponse,
  WaffleDailyProgressResponse,
} from "@/types/waffle";
import type { EvaluatedLetterState } from "@/lib/game-state";
import {
  LEXICON_PROFILE_KEYS,
  type LexiconProfileKey,
} from "@/lib/lexicon-profile-keys";

const VALIDATE_WORD_TIMEOUT_MS = 5000;
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

const timeoutPromise = (ms: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );

export const validateWord = async (
  word: string,
  expectedLength: number,
  profile: LexiconProfileKey = LEXICON_PROFILE_KEYS.UNLIMITED_GUESS,
  options?: {
    challengeDate?: string;
    challengeVersion?: string;
  },
): Promise<boolean> => {
  const normalizedWord = word.trim().toLowerCase();

  if (!normalizedWord) {
    return false;
  }

  if (!/^[a-z]+$/i.test(normalizedWord)) {
    return false;
  }

  if (
    expectedLength < MIN_WORD_LENGTH ||
    expectedLength > MAX_WORD_LENGTH ||
    normalizedWord.length !== expectedLength
  ) {
    return false;
  }

  const searchParams = new URLSearchParams({
    word: normalizedWord,
    length: String(expectedLength),
    profile,
  });

  if (options?.challengeDate) {
    searchParams.set("challengeDate", options.challengeDate);
  }

  if (options?.challengeVersion) {
    searchParams.set("challengeVersion", options.challengeVersion);
  }

  try {
    const response = (await Promise.race([
      fetch(`/api/validate-word?${searchParams.toString()}`),
      timeoutPromise(VALIDATE_WORD_TIMEOUT_MS),
    ])) as Response;

    if (response.status === 400) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`Validate word failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { valid?: boolean };
    return data.valid === true;
  } catch (error) {
    console.error("validateWord error:", error);
    throw error;
  }
};

export type DailyWordResponse = {
  challengeToken: string;
  mode: "daily";
  date: string;
  wordLength: number;
  difficulty: "easy" | "medium" | "hard";
  sequence: number;
  timezone: string;
  version: string;
};

export type UnlimitedWordResponse = {
  mode: "unlimited";
  word: string;
  wordLength: number;
  difficulty: "easy" | "medium" | "hard";
};

export type SubmitDailyGuessPayload = {
  challengeDate: string;
  challengeToken?: string;
  challengeVersion?: string;
  guess: string;
  progressToken?: string;
  totalTime: number;
  timezone?: string;
};

export type SubmitDailyGuessResponse = {
  authenticated: boolean;
  completionToken?: string | null;
  valid: boolean;
  guess: string;
  progressToken?: string | null;
  rowResult?: EvaluatedLetterState[];
  isWin?: boolean;
  solutionWord?: string;
  reason?: string;
  session?: DailyChallengeSession | null;
  record?: DailyChallengeRecord | null;
  recordSynced?: boolean;
  communityStats?: DailyChallengeCommunityStats | null;
};

export const fetchDailyWord = async (date?: string): Promise<DailyWordResponse> => {
  const searchParams = new URLSearchParams();

  if (date) {
    searchParams.set("date", date);
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/daily-word${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch daily word: ${response.status}`);
  }

  return response.json() as Promise<DailyWordResponse>;
};

export const fetchUnlimitedWord = async (
  wordLength: number,
): Promise<UnlimitedWordResponse> => {
  const searchParams = new URLSearchParams({
    length: String(wordLength),
  });
  const response = await fetch(`/api/unlimited-word?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch unlimited word: ${response.status}`);
  }

  return response.json() as Promise<UnlimitedWordResponse>;
};

export async function submitDailyGuess(
  payload: SubmitDailyGuessPayload,
) {
  const response = await fetch("/api/daily-guess", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Daily guess submission failed");
  }

  return data as SubmitDailyGuessResponse;
}

export async function fetchAuthSession() {
  const response = await fetch("/api/auth/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auth session: ${response.status}`);
  }

  return response.json();
}

export async function fetchDailyChallengeRecord(
  date?: string,
  options?: { timezone?: string; version?: string },
) {
  const searchParams = new URLSearchParams();

  if (date) {
    searchParams.set("date", date);
  }

  if (options?.version) {
    searchParams.set("version", options.version);
  }

  if (options?.timezone) {
    searchParams.set("timezone", options.timezone);
  }

  const query = searchParams.toString();
  const response = await fetch(
    `/api/daily-challenge-record${query ? `?${query}` : ""}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch daily challenge record: ${response.status}`);
  }

  return response.json() as Promise<DailyChallengeProgressResponse>;
}

export async function saveDailyChallengeRecord(
  payload: SaveDailyChallengeRecordPayload,
) {
  const response = await fetch("/api/daily-challenge-record", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Save daily challenge record failed");
  }

  return data as SaveDailyChallengeRecordResponse;
}

export async function fetchWaffleDailyProgress(date?: string) {
  const searchParams = new URLSearchParams();

  if (date) {
    searchParams.set("date", date);
  }

  const query = searchParams.toString();
  const response = await fetch(`/api/waffle/progress${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch waffle daily progress: ${response.status}`);
  }

  return response.json() as Promise<WaffleDailyProgressResponse>;
}

export async function saveWaffleDailyProgress(
  payload: SaveWaffleDailyProgressPayload,
) {
  const response = await fetch("/api/waffle/progress", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Save waffle daily progress failed");
  }

  return data as SaveWaffleDailyProgressResponse;
}

export const fetcher = (...args: [RequestInfo, RequestInit?]) => 
  fetch(...args).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  });

export default validateWord;
