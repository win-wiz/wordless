import type { Client } from "@libsql/client";

import { ensureAuthTables } from "@/server/auth-schema";
import { createTursoClient } from "@/server/turso";

declare global {
  // eslint-disable-next-line no-var
  var __wordlessAuthTablesReadyPromise: Promise<void> | null | undefined;
}

function createAuthTablesReadyPromise(reset: () => void) {
  return (async () => {
    const client = createTursoClient() as Client;

    try {
      await ensureAuthTables(client);
    } finally {
      client.close();
    }
  })().catch((error) => {
    reset();
    throw error;
  });
}

export function ensureAuthTablesReady() {
  if (!globalThis.__wordlessAuthTablesReadyPromise) {
    globalThis.__wordlessAuthTablesReadyPromise = createAuthTablesReadyPromise(() => {
      globalThis.__wordlessAuthTablesReadyPromise = null;
    });
  }

  return globalThis.__wordlessAuthTablesReadyPromise;
}
