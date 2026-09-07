// @ts-nocheck

async function queryRows(client, sql, args = []) {
  const result = await client.execute({
    sql,
    args,
  });

  return result.rows;
}

async function tableExists(client, tableName) {
  const rows = await queryRows(
    client,
    `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name = ?
      LIMIT 1
    `,
    [tableName],
  );

  return rows.length > 0;
}

async function getTableColumns(client, tableName) {
  const rows = await queryRows(client, `PRAGMA table_info(${tableName})`);
  return new Set(rows.map((row) => String(row.name)));
}

async function getUniqueIndexColumns(client, tableName) {
  const indexRows = await queryRows(client, `PRAGMA index_list(${tableName})`);
  const uniqueIndexes = [];

  for (const indexRow of indexRows) {
    if (Number(indexRow.unique ?? 0) !== 1) {
      continue;
    }

    const indexName = String(indexRow.name);
    const columnRows = await queryRows(client, `PRAGMA index_info(${indexName})`);
    const columns = columnRows
      .sort((left, right) => Number(left.seqno) - Number(right.seqno))
      .map((row) => String(row.name));

    uniqueIndexes.push(columns);
  }

  return uniqueIndexes;
}

async function renameTableIfPresent(client, fromTableName, toTableName) {
  const fromExists = await tableExists(client, fromTableName);
  const toExists = await tableExists(client, toTableName);

  if (!fromExists || toExists) {
    return;
  }

  await client.execute(`ALTER TABLE ${fromTableName} RENAME TO ${toTableName}`);
}

function hasExactColumns(indexes, expectedColumns) {
  return indexes.some(
    (columns) =>
      columns.length === expectedColumns.length &&
      columns.every((column, index) => column === expectedColumns[index]),
  );
}

async function getTableSql(client, tableName) {
  const rows = await queryRows(
    client,
    `
      SELECT sql
      FROM sqlite_master
      WHERE type = 'table'
        AND name = ?
      LIMIT 1
    `,
    [tableName],
  );

  return rows[0]?.sql ? String(rows[0].sql) : null;
}

async function rebuildGameModesTable(client) {
  await renameTableIfPresent(client, "game_modes__migrated", "game_modes");

  const hasTable = await tableExists(client, "game_modes");

  if (!hasTable) {
    return;
  }

  const tableSql = await getTableSql(client, "game_modes");

  if (
    tableSql &&
    tableSql.includes("unlimited-answer") &&
    tableSql.includes("(selection_strategy = 'random' AND schedule_version IS NULL)")
  ) {
    return;
  }

  const columns = await getTableColumns(client, "game_modes");
  const answerProfileKeySelect = columns.has("answer_profile_key")
    ? "answer_profile_key"
    : "NULL";
  const scheduleVersionSelect = columns.has("schedule_version")
    ? "schedule_version"
    : "NULL";
  const timezoneSelect = columns.has("timezone")
    ? "timezone"
    : "'UTC'";
  const configVersionSelect = columns.has("config_version")
    ? "config_version"
    : "'v1'";
  const createdAtSelect = columns.has("created_at")
    ? "created_at"
    : "CURRENT_TIMESTAMP";
  const updatedAtSelect = columns.has("updated_at")
    ? "updated_at"
    : "CURRENT_TIMESTAMP";

  await client.execute("PRAGMA foreign_keys = OFF");

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS game_modes__migrated (
        mode_key TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
        selection_strategy TEXT NOT NULL CHECK (
          selection_strategy IN ('random', 'scheduled')
        ),
        guess_profile_key TEXT NOT NULL CHECK (
          guess_profile_key IN ('daily-guess', 'daily-answer', 'unlimited-answer', 'unlimited-guess')
        ),
        answer_profile_key TEXT CHECK (
          answer_profile_key IS NULL
          OR answer_profile_key IN ('daily-guess', 'daily-answer', 'unlimited-answer', 'unlimited-guess')
        ),
        schedule_version TEXT,
        default_word_length INTEGER NOT NULL CHECK (default_word_length BETWEEN 3 AND 8),
        timezone TEXT NOT NULL DEFAULT 'UTC',
        config_version TEXT NOT NULL DEFAULT 'v1',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (
          (selection_strategy = 'random' AND schedule_version IS NULL)
          OR
          (selection_strategy = 'scheduled' AND answer_profile_key IS NOT NULL AND schedule_version IS NOT NULL)
        )
      )
    `);

    await client.execute(`
      INSERT INTO game_modes__migrated (
        mode_key,
        display_name,
        enabled,
        selection_strategy,
        guess_profile_key,
        answer_profile_key,
        schedule_version,
        default_word_length,
        timezone,
        config_version,
        created_at,
        updated_at
      )
      SELECT
        mode_key,
        display_name,
        enabled,
        selection_strategy,
        guess_profile_key,
        ${answerProfileKeySelect},
        ${scheduleVersionSelect},
        default_word_length,
        ${timezoneSelect},
        ${configVersionSelect},
        ${createdAtSelect},
        ${updatedAtSelect}
      FROM game_modes
    `);

    await client.execute("DROP TABLE game_modes");
    await client.execute("ALTER TABLE game_modes__migrated RENAME TO game_modes");
  } finally {
    await client.execute("PRAGMA foreign_keys = ON");
  }
}

async function rebuildDailyScheduleTable(client) {
  await renameTableIfPresent(client, "daily_schedule__migrated", "daily_schedule");

  const hasTable = await tableExists(client, "daily_schedule");

  if (!hasTable) {
    return;
  }

  const uniqueIndexes = await getUniqueIndexColumns(client, "daily_schedule");

  if (hasExactColumns(uniqueIndexes, ["challenge_date", "version"])) {
    return;
  }

  const columns = await getTableColumns(client, "daily_schedule");
  const versionSelect = columns.has("version") ? "version" : "'v1'";
  const statusSelect = columns.has("status") ? "status" : "'scheduled'";
  const createdAtSelect = columns.has("created_at")
    ? "created_at"
    : "CURRENT_TIMESTAMP";
  const updatedAtSelect = columns.has("updated_at")
    ? "updated_at"
    : "CURRENT_TIMESTAMP";

  await client.execute(`
    CREATE TABLE IF NOT EXISTS daily_schedule__migrated (
      challenge_date TEXT NOT NULL,
      word TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      sequence INTEGER NOT NULL,
      version TEXT NOT NULL DEFAULT 'v1',
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'archived')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (challenge_date, version),
      FOREIGN KEY (word) REFERENCES lexicon_words(word) ON DELETE RESTRICT
    )
  `);

  await client.execute(`
    INSERT INTO daily_schedule__migrated (
      challenge_date,
      word,
      difficulty,
      sequence,
      version,
      status,
      created_at,
      updated_at
    )
    SELECT
      challenge_date,
      word,
      difficulty,
      sequence,
      ${versionSelect},
      ${statusSelect},
      ${createdAtSelect},
      ${updatedAtSelect}
    FROM daily_schedule
  `);

  await client.execute("DROP TABLE daily_schedule");
  await client.execute("ALTER TABLE daily_schedule__migrated RENAME TO daily_schedule");
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_schedule_version_date
      ON daily_schedule (version, challenge_date DESC)
  `);
}

async function rebuildDailyChallengeSessionsTable(client) {
  await renameTableIfPresent(
    client,
    "daily_challenge_sessions__migrated",
    "daily_challenge_sessions",
  );

  const hasTable = await tableExists(client, "daily_challenge_sessions");

  if (!hasTable) {
    return;
  }

  const uniqueIndexes = await getUniqueIndexColumns(client, "daily_challenge_sessions");

  if (hasExactColumns(uniqueIndexes, ["user_id", "challenge_date", "challenge_version"])) {
    return;
  }

  const columns = await getTableColumns(client, "daily_challenge_sessions");
  const totalTimeSelect = columns.has("total_time") ? "total_time" : "0";
  const createdAtSelect = columns.has("created_at")
    ? "created_at"
    : "CURRENT_TIMESTAMP";
  const updatedAtSelect = columns.has("updated_at")
    ? "updated_at"
    : "CURRENT_TIMESTAMP";

  await client.execute(`
    CREATE TABLE IF NOT EXISTS daily_challenge_sessions__migrated (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_date TEXT NOT NULL,
      challenge_version TEXT NOT NULL DEFAULT 'v1',
      challenge_sequence INTEGER NOT NULL,
      word_length INTEGER NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      total_time INTEGER NOT NULL DEFAULT 0,
      guesses_json TEXT NOT NULL DEFAULT '[]',
      row_results_json TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      is_win INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_date, challenge_version)
    )
  `);

  await client.execute(`
    INSERT INTO daily_challenge_sessions__migrated (
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      word_length,
      attempt_count,
      total_time,
      guesses_json,
      row_results_json,
      completed,
      is_win,
      created_at,
      updated_at
    )
    SELECT
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      word_length,
      attempt_count,
      ${totalTimeSelect},
      guesses_json,
      row_results_json,
      completed,
      is_win,
      ${createdAtSelect},
      ${updatedAtSelect}
    FROM daily_challenge_sessions
  `);

  await client.execute("DROP TABLE daily_challenge_sessions");
  await client.execute("ALTER TABLE daily_challenge_sessions__migrated RENAME TO daily_challenge_sessions");
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_sessions_user_date
      ON daily_challenge_sessions (user_id, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_sessions_user_version_date
      ON daily_challenge_sessions (user_id, challenge_version, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_sessions_updated_at
      ON daily_challenge_sessions (updated_at DESC)
  `);
}

async function rebuildDailyChallengeRecordsTable(client) {
  await renameTableIfPresent(
    client,
    "daily_challenge_records__migrated",
    "daily_challenge_records",
  );

  const hasTable = await tableExists(client, "daily_challenge_records");

  if (!hasTable) {
    return;
  }

  const uniqueIndexes = await getUniqueIndexColumns(client, "daily_challenge_records");

  if (hasExactColumns(uniqueIndexes, ["user_id", "challenge_date", "challenge_version"])) {
    return;
  }

  const columns = await getTableColumns(client, "daily_challenge_records");
  const patternSelect = columns.has("pattern") ? "pattern" : "NULL";
  const createdAtSelect = columns.has("created_at")
    ? "created_at"
    : "CURRENT_TIMESTAMP";
  const updatedAtSelect = columns.has("updated_at")
    ? "updated_at"
    : "CURRENT_TIMESTAMP";

  await client.execute(`
    CREATE TABLE IF NOT EXISTS daily_challenge_records__migrated (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_date TEXT NOT NULL,
      challenge_version TEXT NOT NULL DEFAULT 'v1',
      challenge_sequence INTEGER NOT NULL,
      answer_word TEXT NOT NULL,
      word_length INTEGER NOT NULL,
      is_win INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL,
      max_attempts INTEGER NOT NULL,
      total_time INTEGER NOT NULL DEFAULT 0,
      pattern TEXT,
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_date, challenge_version)
    )
  `);

  await client.execute(`
    INSERT INTO daily_challenge_records__migrated (
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      answer_word,
      word_length,
      is_win,
      attempts,
      max_attempts,
      total_time,
      pattern,
      completed_at,
      created_at,
      updated_at
    )
    SELECT
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      answer_word,
      word_length,
      is_win,
      attempts,
      max_attempts,
      total_time,
      ${patternSelect},
      completed_at,
      ${createdAtSelect},
      ${updatedAtSelect}
    FROM daily_challenge_records
  `);

  await client.execute("DROP TABLE daily_challenge_records");
  await client.execute("ALTER TABLE daily_challenge_records__migrated RENAME TO daily_challenge_records");
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_user_date
      ON daily_challenge_records (user_id, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_user_version_date
      ON daily_challenge_records (user_id, challenge_version, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_version_date
      ON daily_challenge_records (challenge_version, challenge_date)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_completed_at
      ON daily_challenge_records (completed_at DESC)
  `);
}

async function rebuildWaffleDailySessionsTable(client) {
  await renameTableIfPresent(
    client,
    "waffle_daily_sessions__migrated",
    "waffle_daily_sessions",
  );

  const hasTable = await tableExists(client, "waffle_daily_sessions");

  if (!hasTable) {
    return;
  }

  const uniqueIndexes = await getUniqueIndexColumns(client, "waffle_daily_sessions");

  if (hasExactColumns(uniqueIndexes, ["user_id", "challenge_date", "challenge_version"])) {
    return;
  }

  const columns = await getTableColumns(client, "waffle_daily_sessions");
  const createdAtSelect = columns.has("created_at") ? "created_at" : "CURRENT_TIMESTAMP";
  const updatedAtSelect = columns.has("updated_at") ? "updated_at" : "CURRENT_TIMESTAMP";

  await client.execute(`
    CREATE TABLE IF NOT EXISTS waffle_daily_sessions__migrated (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_date TEXT NOT NULL,
      challenge_version TEXT NOT NULL DEFAULT 'v1',
      challenge_sequence INTEGER NOT NULL,
      puzzle_id TEXT NOT NULL,
      current_letters_json TEXT NOT NULL DEFAULT '[]',
      swaps_used INTEGER NOT NULL DEFAULT 0,
      max_swaps INTEGER NOT NULL DEFAULT 15,
      total_time INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      is_win INTEGER,
      revealed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_date, challenge_version)
    )
  `);

  await client.execute(`
    INSERT INTO waffle_daily_sessions__migrated (
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      puzzle_id,
      current_letters_json,
      swaps_used,
      max_swaps,
      total_time,
      completed,
      is_win,
      revealed,
      created_at,
      updated_at
    )
    SELECT
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      puzzle_id,
      current_letters_json,
      swaps_used,
      max_swaps,
      total_time,
      completed,
      is_win,
      revealed,
      ${createdAtSelect},
      ${updatedAtSelect}
    FROM waffle_daily_sessions
  `);

  await client.execute("DROP TABLE waffle_daily_sessions");
  await client.execute("ALTER TABLE waffle_daily_sessions__migrated RENAME TO waffle_daily_sessions");
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_sessions_user_date
      ON waffle_daily_sessions (user_id, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_sessions_user_version_date
      ON waffle_daily_sessions (user_id, challenge_version, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_sessions_updated_at
      ON waffle_daily_sessions (updated_at DESC)
  `);
}

async function rebuildWaffleDailyRecordsTable(client) {
  await renameTableIfPresent(
    client,
    "waffle_daily_records__migrated",
    "waffle_daily_records",
  );

  const hasTable = await tableExists(client, "waffle_daily_records");

  if (!hasTable) {
    return;
  }

  const uniqueIndexes = await getUniqueIndexColumns(client, "waffle_daily_records");

  if (hasExactColumns(uniqueIndexes, ["user_id", "challenge_date", "challenge_version"])) {
    return;
  }

  const columns = await getTableColumns(client, "waffle_daily_records");
  const createdAtSelect = columns.has("created_at") ? "created_at" : "CURRENT_TIMESTAMP";
  const updatedAtSelect = columns.has("updated_at") ? "updated_at" : "CURRENT_TIMESTAMP";

  await client.execute(`
    CREATE TABLE IF NOT EXISTS waffle_daily_records__migrated (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_date TEXT NOT NULL,
      challenge_version TEXT NOT NULL DEFAULT 'v1',
      challenge_sequence INTEGER NOT NULL,
      puzzle_id TEXT NOT NULL,
      is_win INTEGER NOT NULL DEFAULT 0,
      swaps_used INTEGER NOT NULL,
      max_swaps INTEGER NOT NULL DEFAULT 15,
      stars INTEGER NOT NULL DEFAULT 0,
      total_time INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_date, challenge_version)
    )
  `);

  await client.execute(`
    INSERT INTO waffle_daily_records__migrated (
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      puzzle_id,
      is_win,
      swaps_used,
      max_swaps,
      stars,
      total_time,
      completed_at,
      created_at,
      updated_at
    )
    SELECT
      id,
      user_id,
      challenge_date,
      challenge_version,
      challenge_sequence,
      puzzle_id,
      is_win,
      swaps_used,
      max_swaps,
      stars,
      total_time,
      completed_at,
      ${createdAtSelect},
      ${updatedAtSelect}
    FROM waffle_daily_records
  `);

  await client.execute("DROP TABLE waffle_daily_records");
  await client.execute("ALTER TABLE waffle_daily_records__migrated RENAME TO waffle_daily_records");
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_user_date
      ON waffle_daily_records (user_id, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_user_version_date
      ON waffle_daily_records (user_id, challenge_version, challenge_date DESC)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_version_date
      ON waffle_daily_records (challenge_version, challenge_date)
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_completed_at
      ON waffle_daily_records (completed_at DESC)
  `);
}

export async function ensureVersionedDailyScheduleSchema(client) {
  await rebuildDailyScheduleTable(client);
}

export async function ensureGameModesSchema(client) {
  await rebuildGameModesTable(client);
}

export async function ensureVersionedDailyChallengeAuthSchema(client) {
  await rebuildDailyChallengeSessionsTable(client);
  await rebuildDailyChallengeRecordsTable(client);
  await rebuildWaffleDailySessionsTable(client);
  await rebuildWaffleDailyRecordsTable(client);
}
