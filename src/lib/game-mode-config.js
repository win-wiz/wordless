const LEXICON_PROFILE_KEYS = {
  DAILY_ANSWER: "daily-answer",
  DAILY_GUESS: "daily-guess",
  UNLIMITED_ANSWER: "unlimited-answer",
  UNLIMITED_GUESS: "unlimited-guess",
};

/**
 * @typedef {"random" | "scheduled"} GameModeSelectionStrategy
 */

/**
 * @typedef {{
 *   wordLength: number;
 *   enabled: boolean;
 *   isDefault: boolean;
 *   minGuessEligibleWords: number;
 *   minAnswerEligibleWords: number;
 *   minScheduleDays: number;
 * }} GameModeLengthDefinition
 */

/**
 * @typedef {{
 *   modeKey: "daily" | "unlimited";
 *   displayName: string;
 *   enabled: boolean;
 *   selectionStrategy: GameModeSelectionStrategy;
 *   guessProfileKey: string;
 *   answerProfileKey: string | null;
 *   scheduleVersion: string | null;
 *   defaultWordLength: number;
 *   timezone: string;
 *   configVersion: string;
 *   lengths: readonly GameModeLengthDefinition[];
 * }} GameModeDefinition
 */

/**
 * @type {Record<string, GameModeDefinition>}
 */
export const GAME_MODE_DEFINITIONS = Object.freeze({
  daily: Object.freeze({
    modeKey: "daily",
    displayName: "Daily Challenge",
    enabled: true,
    selectionStrategy: "scheduled",
    guessProfileKey: LEXICON_PROFILE_KEYS.DAILY_GUESS,
    answerProfileKey: LEXICON_PROFILE_KEYS.DAILY_ANSWER,
    scheduleVersion: "v1",
    defaultWordLength: 5,
    timezone: "UTC",
    configVersion: "v1",
    lengths: Object.freeze([
      Object.freeze({
        wordLength: 5,
        enabled: true,
        isDefault: true,
        minGuessEligibleWords: 2500,
        minAnswerEligibleWords: 2500,
        minScheduleDays: 2500,
      }),
    ]),
  }),
  unlimited: Object.freeze({
    modeKey: "unlimited",
    displayName: "Unlimited",
    enabled: true,
    selectionStrategy: "random",
    guessProfileKey: LEXICON_PROFILE_KEYS.UNLIMITED_GUESS,
    answerProfileKey: LEXICON_PROFILE_KEYS.UNLIMITED_ANSWER,
    scheduleVersion: null,
    defaultWordLength: 5,
    timezone: "UTC",
    configVersion: "v1",
    lengths: Object.freeze([
      Object.freeze({
        wordLength: 3,
        enabled: true,
        isDefault: false,
        minGuessEligibleWords: 1500,
        minAnswerEligibleWords: 250,
        minScheduleDays: 0,
      }),
      Object.freeze({
        wordLength: 4,
        enabled: true,
        isDefault: false,
        minGuessEligibleWords: 5000,
        minAnswerEligibleWords: 700,
        minScheduleDays: 0,
      }),
      Object.freeze({
        wordLength: 5,
        enabled: true,
        isDefault: true,
        minGuessEligibleWords: 3000,
        minAnswerEligibleWords: 1500,
        minScheduleDays: 0,
      }),
      Object.freeze({
        wordLength: 6,
        enabled: true,
        isDefault: false,
        minGuessEligibleWords: 15000,
        minAnswerEligibleWords: 800,
        minScheduleDays: 0,
      }),
      Object.freeze({
        wordLength: 7,
        enabled: true,
        isDefault: false,
        minGuessEligibleWords: 20000,
        minAnswerEligibleWords: 700,
        minScheduleDays: 0,
      }),
      Object.freeze({
        wordLength: 8,
        enabled: true,
        isDefault: false,
        minGuessEligibleWords: 25000,
        minAnswerEligibleWords: 500,
        minScheduleDays: 0,
      }),
    ]),
  }),
});

/**
 * @param {string} modeKey
 */
export function getGameModeDefinition(modeKey) {
  return GAME_MODE_DEFINITIONS[modeKey] ?? null;
}

export function getEnabledGameModeDefinitions() {
  return Object.values(GAME_MODE_DEFINITIONS).filter((mode) => mode.enabled);
}

/**
 * @param {string} modeKey
 */
export function getEnabledGameModeLengths(modeKey) {
  const definition = getGameModeDefinition(modeKey);

  if (!definition) {
    return [];
  }

  return definition.lengths
    .filter((lengthEntry) => lengthEntry.enabled)
    .map((lengthEntry) => lengthEntry.wordLength)
    .sort((left, right) => left - right);
}

/**
 * @param {string} modeKey
 */
export function getDefaultGameModeLength(modeKey) {
  const definition = getGameModeDefinition(modeKey);

  if (!definition) {
    return null;
  }

  return definition.defaultWordLength;
}
