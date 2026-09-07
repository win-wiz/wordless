// @ts-nocheck
import { ensureDailyScheduleSchemaReady } from "./daily-schedule-bootstrap.ts";
import { getGameModeConfig } from "./game-modes-runtime.js";

export const DAILY_SCHEDULE_DAYS = 2500;
export const DIFFICULTY_PATTERN = ["easy", "medium", "easy", "medium", "hard", "medium", "easy"];
const SCHEDULE_INSERT_BATCH_SIZE = 100;
const DAILY_SCHEDULE_ENTRY_CACHE_TTL_MS = 5 * 60 * 1000;
const DAILY_SCHEDULE_ENTRY_CACHE_MAX_SIZE = 256;
const dailyScheduleEntryCache = new Map();

export async function getDailyModeConfig(client) {
  const config = await getGameModeConfig(client, "daily");

  if (!config || !config.enabled) {
    throw new Error("Daily mode is not configured.");
  }

  return config;
}

export async function getDailyWordLength(client) {
  const config = await getDailyModeConfig(client);
  return config.defaultWordLength;
}

export async function getDailyScheduleVersion(client) {
  const config = await getDailyModeConfig(client);
  return config.scheduleVersion ?? "v1";
}

export async function getDailyTimezone(client) {
  const config = await getDailyModeConfig(client);
  return config.timezone;
}

async function getDailyAnswerProfileKey(client) {
  const config = await getDailyModeConfig(client);
  return config.answerProfileKey ?? "daily-answer";
}

function chunk(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getDailyScheduleEntryCacheKey(dateKey, version) {
  return `${version}:${dateKey}`;
}

function readCachedDailyScheduleEntry(dateKey, version) {
  const cacheKey = getDailyScheduleEntryCacheKey(dateKey, version);
  const cached = dailyScheduleEntryCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    dailyScheduleEntryCache.delete(cacheKey);
    return null;
  }

  dailyScheduleEntryCache.delete(cacheKey);
  dailyScheduleEntryCache.set(cacheKey, cached);

  return cached.value;
}

function writeCachedDailyScheduleEntry(dateKey, version, value) {
  const cacheKey = getDailyScheduleEntryCacheKey(dateKey, version);

  if (dailyScheduleEntryCache.size >= DAILY_SCHEDULE_ENTRY_CACHE_MAX_SIZE) {
    const oldestKey = dailyScheduleEntryCache.keys().next().value;

    if (oldestKey) {
      dailyScheduleEntryCache.delete(oldestKey);
    }
  }

  dailyScheduleEntryCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + DAILY_SCHEDULE_ENTRY_CACHE_TTL_MS,
  });
}

function clearDailyScheduleEntryCache() {
  dailyScheduleEntryCache.clear();
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function getUtcDateKey(date = new Date()) {
  return formatDateKey(date);
}

function getTimeZoneDatePart(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date for timezone ${timeZone}.`);
  }

  return `${year}-${month}-${day}`;
}

export function getDateKeyForTimezone(timeZone, date = new Date()) {
  return getTimeZoneDatePart(date, timeZone);
}

export function parseUtcDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function addUtcDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function diffUtcDays(startDate, endDate) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86400000);
}

function sharesTooMuchWithPrevious(word, previousWord) {
  if (!previousWord) {
    return false;
  }

  const overlap = [...new Set(word)].filter((letter) => previousWord.includes(letter)).length;
  return overlap >= 4 || word[0] === previousWord[0] || word.at(-1) === previousWord.at(-1);
}

function pickCandidate(bucket, usedWords, previousWord) {
  const unused = bucket.filter((candidate) => !usedWords.has(candidate.word));
  const preferred = unused.find((candidate) => !sharesTooMuchWithPrevious(candidate.word, previousWord));

  return preferred ?? unused[0] ?? null;
}

function createBuckets(candidates) {
  const buckets = {
    easy: [],
    medium: [],
    hard: [],
  };

  for (const candidate of candidates) {
    buckets[candidate.difficulty].push(candidate);
  }

  buckets.easy.sort((a, b) => b.dailyScore - a.dailyScore || a.word.localeCompare(b.word));
  buckets.medium.sort((a, b) => b.dailyScore - a.dailyScore || a.word.localeCompare(b.word));
  buckets.hard.sort((a, b) => a.dailyScore - b.dailyScore || a.word.localeCompare(b.word));

  return buckets;
}

function normalizeExistingScheduleEntries(existingEntries, candidateMap) {
  const preservedEntriesByDate = new Map();
  const preservedWords = new Set();

  for (const entry of existingEntries) {
    const challengeDate = String(
      entry.challengeDate ?? entry.challenge_date ?? entry.date ?? "",
    ).trim();
    const word = String(entry.word ?? "").trim().toLowerCase();

    if (!challengeDate || !word || preservedEntriesByDate.has(challengeDate) || preservedWords.has(word)) {
      continue;
    }

    const candidate = candidateMap.get(word);

    preservedEntriesByDate.set(challengeDate, {
      challengeDate,
      word,
      difficulty: candidate?.difficulty ?? String(entry.difficulty ?? "medium"),
      sequence: Number(entry.sequence ?? 0) || null,
      status: String(entry.status ?? "scheduled"),
    });
    preservedWords.add(word);
  }

  return {
    preservedEntriesByDate,
    preservedWords,
  };
}

export function buildDailySchedule(candidates, options = {}) {
  const days = options.days ?? DAILY_SCHEDULE_DAYS;
  const version = options.version ?? "v1";
  const existingEntries = Array.isArray(options.existingEntries)
    ? [...options.existingEntries].sort((left, right) =>
      String(left.challengeDate ?? left.challenge_date ?? left.date ?? "").localeCompare(
        String(right.challengeDate ?? right.challenge_date ?? right.date ?? ""),
      ))
    : [];
  const candidateMap = new Map(candidates.map((candidate) => [candidate.word, candidate]));
  const initialStartDate =
    options.startDate ??
    existingEntries[0]?.challengeDate ??
    existingEntries[0]?.challenge_date ??
    existingEntries[0]?.date ??
    null;
  const startDate = initialStartDate ? new Date(initialStartDate) : new Date();
  const seedUsedWords = new Set(options.usedWords ?? []);
  const sequenceOffset = options.sequenceOffset ?? 0;

  startDate.setUTCHours(0, 0, 0, 0);

  const buckets = createBuckets(candidates);
  const usedWords = new Set(seedUsedWords);
  const { preservedEntriesByDate, preservedWords } = normalizeExistingScheduleEntries(
    existingEntries,
    candidateMap,
  );
  const preservedLastDate = existingEntries.at(-1)?.challengeDate
    ?? existingEntries.at(-1)?.challenge_date
    ?? existingEntries.at(-1)?.date
    ?? null;
  const totalDays = preservedLastDate
    ? Math.max(days, diffUtcDays(startDate, parseUtcDateKey(String(preservedLastDate))) + 1)
    : days;
  const schedule = [];

  for (const word of preservedWords) {
    usedWords.add(word);
  }

  for (let dayIndex = 0; dayIndex < Math.min(totalDays, candidates.length); dayIndex += 1) {
    const challengeDate = formatDateKey(addUtcDays(startDate, dayIndex));
    const preservedEntry = preservedEntriesByDate.get(challengeDate);

    if (preservedEntry) {
      schedule.push({
        challengeDate,
        word: preservedEntry.word,
        difficulty: preservedEntry.difficulty,
        sequence: preservedEntry.sequence ?? sequenceOffset + dayIndex + 1,
        version,
        status: preservedEntry.status,
      });
      continue;
    }

    const preferredDifficulty = DIFFICULTY_PATTERN[dayIndex % DIFFICULTY_PATTERN.length];
    const previousWord = schedule.at(-1)?.word;
    const fallbackOrder = [preferredDifficulty, "medium", "easy", "hard"].filter(
      (value, index, array) => array.indexOf(value) === index,
    );

    let chosen = null;

    for (const difficulty of fallbackOrder) {
      chosen = pickCandidate(buckets[difficulty], usedWords, previousWord);
      if (chosen) {
        break;
      }
    }

    if (!chosen) {
      break;
    }

    usedWords.add(chosen.word);

    schedule.push({
      challengeDate,
      word: chosen.word,
      difficulty: chosen.difficulty,
      sequence: sequenceOffset + dayIndex + 1,
      version,
      status: "scheduled",
    });
  }

  return schedule;
}

async function fetchStoredDailyScheduleEntries(client, version) {
  await ensureDailyScheduleSchemaReady();
  const result = await client.execute({
    sql: `
      SELECT
        challenge_date,
        word,
        difficulty,
        sequence,
        status
      FROM daily_schedule
      WHERE version = ?
      ORDER BY challenge_date ASC
    `,
    args: [version],
  });

  return result.rows.map((row) => ({
    challengeDate: String(row.challenge_date),
    word: String(row.word),
    difficulty: String(row.difficulty),
    sequence: Number(row.sequence),
    status: String(row.status ?? "scheduled"),
  }));
}

export async function fetchDailyCandidates(client, wordLength) {
  const resolvedWordLength = wordLength ?? await getDailyWordLength(client);
  const answerProfileKey = await getDailyAnswerProfileKey(client);
  const result = await client.execute({
    sql: `
      SELECT
        lw.word,
        lw.difficulty,
        lp.score
      FROM lexicon_profiles lp
      JOIN lexicon_words lw ON lw.word = lp.word
      WHERE lp.profile_key = ?
        AND lp.word_length = ?
        AND lp.eligible = 1
      ORDER BY lp.score DESC, lw.word ASC
    `,
    args: [answerProfileKey, resolvedWordLength],
  });

  return result.rows.map((row) => ({
    word: String(row.word),
    difficulty: String(row.difficulty),
    dailyScore: Number(row.score ?? 0),
  }));
}

async function insertDailyScheduleEntries(client, schedule) {
  for (const batch of chunk(schedule, SCHEDULE_INSERT_BATCH_SIZE)) {
    await client.batch(batch.map((entry) => ({
      sql: `
        INSERT INTO daily_schedule (
          challenge_date,
          word,
          difficulty,
          sequence,
          version,
          status,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      args: [
        entry.challengeDate,
        entry.word,
        entry.difficulty,
        entry.sequence,
        entry.version,
        entry.status,
      ],
    })));
  }
}

export async function replaceDailySchedule(client, schedule, options = {}) {
  const version = options.version ?? await getDailyScheduleVersion(client);
  await ensureDailyScheduleSchemaReady();

  await client.execute({
    sql: "DELETE FROM daily_schedule WHERE version = ?",
    args: [version],
  });

  await insertDailyScheduleEntries(client, schedule);
  clearDailyScheduleEntryCache();

  return schedule.length;
}

export async function generateAndStoreDailySchedule(client, options = {}) {
  const wordLength = options.wordLength ?? await getDailyWordLength(client);
  const version = options.version ?? await getDailyScheduleVersion(client);
  const candidates = await fetchDailyCandidates(client, wordLength);

  if (candidates.length === 0) {
    throw new Error("No daily answer candidates were found in lexicon_words.");
  }

  const existingEntries = options.existingEntries
    ?? await fetchStoredDailyScheduleEntries(client, version);
  const schedule = buildDailySchedule(candidates, {
    ...options,
    version,
    existingEntries,
  });

  if (schedule.length === 0) {
    throw new Error("Daily schedule generation produced no rows.");
  }

  await replaceDailySchedule(client, schedule, {
    version,
  });

  return {
    schedule,
    startDate: schedule[0]?.challengeDate ?? null,
    endDate: schedule.at(-1)?.challengeDate ?? null,
    totalDays: schedule.length,
    wordLength,
    timezone: await getDailyTimezone(client),
    version,
  };
}

export async function getDailyScheduleRange(client, version) {
  const resolvedVersion = version ?? await getDailyScheduleVersion(client);
  await ensureDailyScheduleSchemaReady();
  const result = await client.execute({
    sql: `
      SELECT
        MIN(challenge_date) AS start_date,
        MAX(challenge_date) AS end_date,
        COUNT(*) AS total_days,
        MAX(sequence) AS max_sequence
      FROM daily_schedule
      WHERE version = ?
    `,
    args: [resolvedVersion],
  });

  const row = result.rows[0];

  return {
    startDate: row?.start_date ? String(row.start_date) : null,
    endDate: row?.end_date ? String(row.end_date) : null,
    totalDays: row?.total_days ? Number(row.total_days) : 0,
    maxSequence: row?.max_sequence ? Number(row.max_sequence) : 0,
  };
}

export async function fetchScheduledWords(client, version) {
  const resolvedVersion = version ?? await getDailyScheduleVersion(client);
  await ensureVersionedDailyScheduleSchema(client);
  const result = await client.execute({
    sql: `
      SELECT word
      FROM daily_schedule
      WHERE version = ?
    `,
    args: [resolvedVersion],
  });

  return result.rows.map((row) => String(row.word));
}

export async function getDailyScheduleEntry(client, dateKey, version) {
  const resolvedVersion = version ?? await getDailyScheduleVersion(client);
  const cached = readCachedDailyScheduleEntry(dateKey, resolvedVersion);

  if (cached) {
    return cached;
  }

  const result = await client.execute({
    sql: `
      SELECT
        ds.challenge_date,
        ds.word,
        ds.difficulty,
        ds.sequence,
        lw.word_length
      FROM daily_schedule ds
      JOIN lexicon_words lw ON lw.word = ds.word
      WHERE ds.challenge_date = ?
        AND ds.version = ?
      LIMIT 1
    `,
    args: [dateKey, resolvedVersion],
  });

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const entry = {
    date: String(row.challenge_date),
    word: String(row.word),
    difficulty: String(row.difficulty),
    sequence: Number(row.sequence),
    wordLength: Number(row.word_length),
  };

  writeCachedDailyScheduleEntry(dateKey, resolvedVersion, entry);

  return entry;
}

export async function appendDailySchedule(client, options = {}) {
  const version = options.version ?? await getDailyScheduleVersion(client);
  const wordLength = options.wordLength ?? await getDailyWordLength(client);
  const range = await getDailyScheduleRange(client, version);
  const scheduledWords = new Set(await fetchScheduledWords(client, version));
  const candidates = await fetchDailyCandidates(client, wordLength);
  const availableCandidates = candidates.filter((candidate) => !scheduledWords.has(candidate.word));

  if (availableCandidates.length === 0) {
    throw new Error("No unused daily answer candidates are available for schedule extension.");
  }

  const schedule = buildDailySchedule(availableCandidates, {
    days: options.days ?? DAILY_SCHEDULE_DAYS,
    startDate: options.startDate,
    version,
    usedWords: scheduledWords,
    sequenceOffset: range.maxSequence,
  });

  if (schedule.length === 0) {
    throw new Error("Daily schedule extension produced no rows.");
  }

  await insertDailyScheduleEntries(client, schedule);
  clearDailyScheduleEntryCache();

  return {
    schedule,
    startDate: schedule[0]?.challengeDate ?? null,
    endDate: schedule.at(-1)?.challengeDate ?? null,
    totalDays: schedule.length,
    version,
    wordLength,
  };
}

export async function ensureDailyScheduleCoverage(client, dateKey, options = {}) {
  const version = options.version ?? await getDailyScheduleVersion(client);
  const wordLength = options.wordLength ?? await getDailyWordLength(client);

  let entry = await getDailyScheduleEntry(client, dateKey, version);

  if (entry) {
    return {
      entry,
      replenished: false,
    };
  }

  const range = await getDailyScheduleRange(client, version);

  if (range.totalDays === 0) {
    await generateAndStoreDailySchedule(client, {
      days: options.days ?? DAILY_SCHEDULE_DAYS,
      startDate: parseUtcDateKey(dateKey),
      version,
      wordLength,
    });

    entry = await getDailyScheduleEntry(client, dateKey, version);

    return {
      entry,
      replenished: true,
    };
  }

  if (range.endDate && dateKey > range.endDate) {
    const appendStartDate = addUtcDays(parseUtcDateKey(range.endDate), 1);
    const requiredDays = diffUtcDays(appendStartDate, parseUtcDateKey(dateKey)) + 1;

    await appendDailySchedule(client, {
      days: Math.max(options.days ?? DAILY_SCHEDULE_DAYS, requiredDays),
      startDate: appendStartDate,
      version,
      wordLength,
    });

    entry = await getDailyScheduleEntry(client, dateKey, version);

    return {
      entry,
      replenished: true,
    };
  }

  return {
    entry: null,
    replenished: false,
  };
}
