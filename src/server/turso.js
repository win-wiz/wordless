// @ts-nocheck
import { createClient } from "@libsql/client";

function resolveLocalDbUrl() {
  if (process.env.WORDLESS_LOCAL_DB_URL) {
    return process.env.WORDLESS_LOCAL_DB_URL;
  }

  if (process.env.WORDLESS_USE_LOCAL_DB !== "1") {
    return null;
  }

  const configuredPath = process.env.WORDLESS_LOCAL_DB_PATH || "db/wordless-local.db";
  return configuredPath.startsWith("file:") ? configuredPath : `file:${configuredPath}`;
}

export function createTursoClient() {
  const url = resolveLocalDbUrl() || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "Missing database configuration. Please set WORDLESS_LOCAL_DB_URL, or enable WORDLESS_USE_LOCAL_DB, or set TURSO_DATABASE_URL.",
    );
  }

  if (!url.startsWith("file:") && !authToken) {
    throw new Error("Missing Turso configuration. Please set TURSO_AUTH_TOKEN.");
  }

  return createClient({
    url,
    authToken: url.startsWith("file:") ? undefined : authToken,
  });
}
