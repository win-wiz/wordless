import type { Client } from "@libsql/client";

import {
  clearGameModeConfigCache as clearGameModeConfigCacheRuntime,
  getGameModeConfig as getGameModeConfigRuntime,
  isEnabledWordLength as isEnabledWordLengthRuntime,
} from "./game-modes-runtime.js";

export type RuntimeGameModeLengthConfig = {
  enabled: boolean;
  isDefault: boolean;
  minAnswerEligibleWords: number;
  minGuessEligibleWords: number;
  minScheduleDays: number;
  wordLength: number;
};

export type RuntimeGameModeConfig = {
  answerProfileKey: string | null;
  configVersion: string;
  defaultWordLength: number;
  displayName: string;
  enabled: boolean;
  guessProfileKey: string;
  lengths: RuntimeGameModeLengthConfig[];
  modeKey: string;
  scheduleVersion: string | null;
  selectionStrategy: "random" | "scheduled";
  timezone: string;
};

export async function getGameModeConfig(
  client: Client,
  modeKey: string,
) {
  return getGameModeConfigRuntime(
    client,
    modeKey,
  ) as Promise<RuntimeGameModeConfig | null>;
}

export function isEnabledWordLength(
  config: RuntimeGameModeConfig,
  wordLength: number,
) {
  return isEnabledWordLengthRuntime(config, wordLength);
}

export function clearGameModeConfigCache() {
  clearGameModeConfigCacheRuntime();
}
