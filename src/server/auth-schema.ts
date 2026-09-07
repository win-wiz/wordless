import type { Client } from "@libsql/client";
import { ensureVersionedDailyChallengeAuthSchema } from "@/server/schema-migrations";

const AUTH_SCHEMA_STATEMENTS = [
  `
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS auth_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      provider_email TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (provider, provider_account_id)
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id
      ON auth_accounts (user_id)
  `,
  `
    CREATE TABLE IF NOT EXISTS app_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id
      ON app_sessions (user_id)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at
      ON app_sessions (expires_at)
  `,
  `
    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
    )
  `,
  `
    CREATE UNIQUE INDEX IF NOT EXISTS idx_visitor_sessions_user_id
      ON visitor_sessions (user_id)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_visitor_sessions_expires_at
      ON visitor_sessions (expires_at)
  `,
  `
    CREATE TABLE IF NOT EXISTS daily_challenge_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_date TEXT NOT NULL,
      challenge_version TEXT NOT NULL DEFAULT 'v1',
      challenge_sequence INTEGER NOT NULL,
      word_length INTEGER NOT NULL,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      guesses_json TEXT NOT NULL DEFAULT '[]',
      row_results_json TEXT NOT NULL DEFAULT '[]',
      completed INTEGER NOT NULL DEFAULT 0,
      is_win INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_date, challenge_version)
    )
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_sessions_user_date
      ON daily_challenge_sessions (user_id, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_sessions_user_version_date
      ON daily_challenge_sessions (user_id, challenge_version, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_sessions_updated_at
      ON daily_challenge_sessions (updated_at DESC)
  `,
  `
    ALTER TABLE daily_challenge_sessions
    ADD COLUMN total_time INTEGER NOT NULL DEFAULT 0
  `,
  `
    CREATE TABLE IF NOT EXISTS daily_challenge_records (
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
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_user_date
      ON daily_challenge_records (user_id, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_user_version_date
      ON daily_challenge_records (user_id, challenge_version, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_version_date
      ON daily_challenge_records (challenge_version, challenge_date)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_completed_at
      ON daily_challenge_records (completed_at DESC)
  `,
  `
    CREATE TABLE IF NOT EXISTS waffle_daily_sessions (
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
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_sessions_user_date
      ON waffle_daily_sessions (user_id, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_sessions_user_version_date
      ON waffle_daily_sessions (user_id, challenge_version, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_sessions_updated_at
      ON waffle_daily_sessions (updated_at DESC)
  `,
  `
    CREATE TABLE IF NOT EXISTS waffle_daily_records (
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
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_user_date
      ON waffle_daily_records (user_id, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_user_version_date
      ON waffle_daily_records (user_id, challenge_version, challenge_date DESC)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_version_date
      ON waffle_daily_records (challenge_version, challenge_date)
  `,
  `
    CREATE INDEX IF NOT EXISTS idx_waffle_daily_records_completed_at
      ON waffle_daily_records (completed_at DESC)
  `,
];

export async function ensureAuthTables(client: Client) {
  for (const statement of AUTH_SCHEMA_STATEMENTS) {
    try {
      await client.execute(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("duplicate column name: total_time")) {
        continue;
      }

      throw error;
    }
  }

  await ensureVersionedDailyChallengeAuthSchema(client);
}
