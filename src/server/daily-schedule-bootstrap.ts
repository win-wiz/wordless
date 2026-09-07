import type { Client } from "@libsql/client";

import { ensureVersionedDailyScheduleSchema } from "./schema-migrations.js";
import { createTursoClient } from "./turso.js";

declare global {
  // eslint-disable-next-line no-var
  var __wordlessDailyScheduleSchemaReadyPromise: Promise<void> | null | undefined;
}

function createDailyScheduleSchemaReadyPromise(reset: () => void) {
  return (async () => {
    const client = createTursoClient() as Client;

    try {
      await ensureVersionedDailyScheduleSchema(client);
    } finally {
      client.close();
    }
  })().catch((error) => {
    reset();
    throw error;
  });
}

export function ensureDailyScheduleSchemaReady() {
  if (!globalThis.__wordlessDailyScheduleSchemaReadyPromise) {
    globalThis.__wordlessDailyScheduleSchemaReadyPromise =
      createDailyScheduleSchemaReadyPromise(() => {
        globalThis.__wordlessDailyScheduleSchemaReadyPromise = null;
      });
  }

  return globalThis.__wordlessDailyScheduleSchemaReadyPromise;
}
