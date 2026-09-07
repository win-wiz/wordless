// @ts-nocheck

const GAME_MODE_CACHE_TTL_MS = 5 * 60 * 1000;

const gameModeCache =
  globalThis.__wordlessGameModeCache ??
  (globalThis.__wordlessGameModeCache = new Map());

function readCachedGameMode(modeKey) {
  const cached = gameModeCache.get(modeKey);

  if (!cached) {
    return { hit: false, value: null };
  }

  if (cached.expiresAt <= Date.now()) {
    gameModeCache.delete(modeKey);
    return { hit: false, value: null };
  }

  return { hit: true, value: cached.value };
}

function writeCachedGameMode(modeKey, value) {
  gameModeCache.set(modeKey, {
    expiresAt: Date.now() + GAME_MODE_CACHE_TTL_MS,
    value,
  });
}

function mapGameModeConfig(rows) {
  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  const lengths = rows
    .filter((row) => row.word_length !== null && row.word_length !== undefined)
    .map((row) => ({
      enabled: Number(row.length_enabled ?? 0) === 1,
      isDefault: Number(row.is_default ?? 0) === 1,
      minAnswerEligibleWords: Number(row.min_answer_eligible_words ?? 0),
      minGuessEligibleWords: Number(row.min_guess_eligible_words ?? 0),
      minScheduleDays: Number(row.min_schedule_days ?? 0),
      wordLength: Number(row.word_length),
    }))
    .sort((left, right) => left.wordLength - right.wordLength);

  return {
    answerProfileKey: firstRow.answer_profile_key
      ? String(firstRow.answer_profile_key)
      : null,
    configVersion: String(firstRow.config_version ?? "v1"),
    defaultWordLength: Number(firstRow.default_word_length),
    displayName: String(firstRow.display_name),
    enabled: Number(firstRow.mode_enabled ?? 0) === 1,
    guessProfileKey: String(firstRow.guess_profile_key),
    lengths,
    modeKey: String(firstRow.mode_key),
    scheduleVersion: firstRow.schedule_version
      ? String(firstRow.schedule_version)
      : null,
    selectionStrategy:
      String(firstRow.selection_strategy) === "scheduled"
        ? "scheduled"
        : "random",
    timezone: String(firstRow.timezone ?? "UTC"),
  };
}

export function isEnabledWordLength(config, wordLength) {
  return config.lengths.some(
    (length) => length.enabled && length.wordLength === wordLength,
  );
}

export async function getGameModeConfig(client, modeKey) {
  const cached = readCachedGameMode(modeKey);

  if (cached.hit) {
    return cached.value;
  }

  const result = await client.execute({
    sql: `
      SELECT
        gm.mode_key,
        gm.display_name,
        gm.enabled AS mode_enabled,
        gm.selection_strategy,
        gm.guess_profile_key,
        gm.answer_profile_key,
        gm.schedule_version,
        gm.default_word_length,
        gm.timezone,
        gm.config_version,
        gml.word_length,
        gml.enabled AS length_enabled,
        gml.is_default,
        gml.min_guess_eligible_words,
        gml.min_answer_eligible_words,
        gml.min_schedule_days
      FROM game_modes gm
      LEFT JOIN game_mode_lengths gml
        ON gml.mode_key = gm.mode_key
      WHERE gm.mode_key = ?
      ORDER BY gml.word_length ASC
    `,
    args: [modeKey],
  });

  const config = mapGameModeConfig(result.rows);
  writeCachedGameMode(modeKey, config);

  return config;
}

export function clearGameModeConfigCache() {
  gameModeCache.clear();
}
