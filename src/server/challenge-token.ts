import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const CHALLENGE_TOKEN_VERSION = "v1";
const PROGRESS_TOKEN_VERSION = "v1";
const COMPLETION_TOKEN_VERSION = "v1";
const CHALLENGE_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const COMPLETION_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const IV_BYTE_LENGTH = 12;

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

function getChallengeTokenKey() {
  return createHash("sha256").update(getChallengeTokenSecret()).digest();
}

function encodeBase64Url(value: Buffer) {
  return value.toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

function encryptPayload(version: string, payload: object) {
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getChallengeTokenKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    version,
    encodeBase64Url(iv),
    encodeBase64Url(authTag),
    encodeBase64Url(encrypted),
  ].join(".");
}

function decryptPayload<T extends { expiresAt: number; version: string }>(
  token: string,
  expectedVersion: string,
): T {
  const [tokenVersion, ivPart, authTagPart, encryptedPart] = token.split(".");

  if (
    tokenVersion !== expectedVersion ||
    !ivPart ||
    !authTagPart ||
    !encryptedPart
  ) {
    throw new Error("Invalid daily challenge token format.");
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getChallengeTokenKey(),
      decodeBase64Url(ivPart),
    );
    decipher.setAuthTag(decodeBase64Url(authTagPart));

    const decrypted = Buffer.concat([
      decipher.update(decodeBase64Url(encryptedPart)),
      decipher.final(),
    ]);
    const payload = JSON.parse(decrypted.toString("utf8")) as T;

    if (payload.version !== expectedVersion || payload.expiresAt <= Date.now()) {
      throw new Error("Invalid daily challenge token payload.");
    }

    return payload;
  } catch {
    throw new Error("Daily challenge token verification failed.");
  }
}

export function issueDailyChallengeToken(input: {
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

export function verifyDailyChallengeToken(token: string) {
  const payload = decryptPayload<DailyChallengeTokenPayload>(
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

export function issueDailyChallengeProgressToken(input: {
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

export function verifyDailyChallengeProgressToken(token: string) {
  const payload = decryptPayload<DailyChallengeProgressTokenPayload>(
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

export function issueDailyChallengeCompletionToken(input: {
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

export function verifyDailyChallengeCompletionToken(token: string) {
  const payload = decryptPayload<DailyChallengeCompletionTokenPayload>(
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
