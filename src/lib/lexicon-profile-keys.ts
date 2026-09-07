export const LEXICON_PROFILE_KEYS = {
  DAILY_ANSWER: "daily-answer",
  DAILY_GUESS: "daily-guess",
  UNLIMITED_ANSWER: "unlimited-answer",
  UNLIMITED_GUESS: "unlimited-guess",
} as const;

export type LexiconProfileKey =
  (typeof LEXICON_PROFILE_KEYS)[keyof typeof LEXICON_PROFILE_KEYS];

const LEXICON_PROFILE_KEY_SET = new Set<string>(Object.values(LEXICON_PROFILE_KEYS));

export function isLexiconProfileKey(value: string): value is LexiconProfileKey {
  return LEXICON_PROFILE_KEY_SET.has(value);
}
