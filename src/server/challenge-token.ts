import { decryptJson, encryptJson } from "@/server/edge-crypto";

const CHALLENGE_TOKEN_VERSION = "v1";
const PROGRESS_TOKEN_VERSION = "v1";
const COMPLETION_TOKEN_VERSION = "v1";
const CHALLENGE_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const COMPLETION_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

type DailyChallengeTokenPayload = {
  answerWord: string;
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  expiresAt: number;
  timezone: string;
  version: string;
  wordLength: number;
};

type DailyChallengeProgressTokenPayload = {
  attemptCount: number;
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  expiresAt: number;
  timezone: string;
  totalTime: number;
  version: string;
  wordLength: number;
};

type DailyChallengeCompletionTokenPayload = {
  answerWord: string;
  attempts: number;
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  expiresAt: number;
  isWin: boolean;
  timezone: string;
  totalTime: number;
  version: string;
  wordLength: number;
};

function getChallengeTokenSecret() {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing AUTH_SECRET for daily challenge tokens.");
  }

  return secret;
}

async function encryptPayload(version: string, payload: object) {
  return encryptJson(version, payload, getChallengeTokenSecret());
}

async function decryptPayload<T extends { expiresAt: number; version: string }>(
  token: string,
  expectedVersion: string,
): Promise<T> {
  const payload = await decryptJson<T>(
    token,
    expectedVersion,
    getChallengeTokenSecret(),
  );

  if (payload.version !== expectedVersion || payload.expiresAt <= Date.now()) {
    throw new Error("Invalid daily challenge token payload.");
  }

  return payload;
}

export async function issueDailyChallengeToken(input: {
  answerWord: string;
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  timezone: string;
  wordLength: number;
}) {
  const payload: DailyChallengeTokenPayload = {
    answerWord: input.answerWord.toUpperCase(),
    challengeDate: input.challengeDate,
    challengeSequence: input.challengeSequence,
    challengeVersion: input.challengeVersion,
    expiresAt: Date.now() + CHALLENGE_TOKEN_TTL_MS,
    timezone: input.timezone,
    version: CHALLENGE_TOKEN_VERSION,
    wordLength: input.wordLength,
  };

  return encryptPayload(CHALLENGE_TOKEN_VERSION, payload);
}

export async function verifyDailyChallengeToken(token: string) {
  const payload = await decryptPayload<DailyChallengeTokenPayload>(
    token,
    CHALLENGE_TOKEN_VERSION,
  );

  if (
    !payload.answerWord ||
    !payload.challengeDate ||
    !payload.challengeVersion ||
    !payload.timezone ||
    !Number.isInteger(payload.challengeSequence) ||
    !Number.isInteger(payload.wordLength)
  ) {
    throw new Error("Invalid daily challenge token payload.");
  }

  return payload;
}

export async function issueDailyChallengeProgressToken(input: {
  attemptCount: number;
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  timezone: string;
  totalTime: number;
  wordLength: number;
}) {
  const payload: DailyChallengeProgressTokenPayload = {
    attemptCount: input.attemptCount,
    challengeDate: input.challengeDate,
    challengeSequence: input.challengeSequence,
    challengeVersion: input.challengeVersion,
    expiresAt: Date.now() + CHALLENGE_TOKEN_TTL_MS,
    timezone: input.timezone,
    totalTime: input.totalTime,
    version: PROGRESS_TOKEN_VERSION,
    wordLength: input.wordLength,
  };

  return encryptPayload(PROGRESS_TOKEN_VERSION, payload);
}

export async function verifyDailyChallengeProgressToken(token: string) {
  const payload = await decryptPayload<DailyChallengeProgressTokenPayload>(
    token,
    PROGRESS_TOKEN_VERSION,
  );

  if (
    !payload.challengeDate ||
    !payload.challengeVersion ||
    !payload.timezone ||
    !Number.isInteger(payload.attemptCount) ||
    !Number.isInteger(payload.challengeSequence) ||
    !Number.isInteger(payload.totalTime) ||
    !Number.isInteger(payload.wordLength)
  ) {
    throw new Error("Invalid daily progress token payload.");
  }

  return payload;
}

export async function issueDailyChallengeCompletionToken(input: {
  answerWord: string;
  attempts: number;
  challengeDate: string;
  challengeSequence: number;
  challengeVersion: string;
  isWin: boolean;
  timezone: string;
  totalTime: number;
  wordLength: number;
}) {
  const payload: DailyChallengeCompletionTokenPayload = {
    answerWord: input.answerWord.toUpperCase(),
    attempts: input.attempts,
    challengeDate: input.challengeDate,
    challengeSequence: input.challengeSequence,
    challengeVersion: input.challengeVersion,
    expiresAt: Date.now() + COMPLETION_TOKEN_TTL_MS,
    isWin: input.isWin,
    timezone: input.timezone,
    totalTime: input.totalTime,
    version: COMPLETION_TOKEN_VERSION,
    wordLength: input.wordLength,
  };

  return encryptPayload(COMPLETION_TOKEN_VERSION, payload);
}

export async function verifyDailyChallengeCompletionToken(token: string) {
  const payload = await decryptPayload<DailyChallengeCompletionTokenPayload>(
    token,
    COMPLETION_TOKEN_VERSION,
  );

  if (
    !payload.answerWord ||
    !payload.challengeDate ||
    !payload.challengeVersion ||
    !payload.timezone ||
    !Number.isInteger(payload.attempts) ||
    !Number.isInteger(payload.challengeSequence) ||
    !Number.isInteger(payload.totalTime) ||
    !Number.isInteger(payload.wordLength)
  ) {
    throw new Error("Invalid daily completion token payload.");
  }

  return payload;
}
