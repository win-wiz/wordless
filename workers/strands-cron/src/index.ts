// Strands 每日题分配 Cron Worker
// 职责：从 strands_puzzles 库存中取题写入 daily_strands（对照 scripts/assign-daily-strands.js 的轻量部分）。
// 不负责 LLM 生成新题 —— 库存不足时通过 ALERT_WEBHOOK_URL 告警，由人工跑 pnpm db:generate-strands-puzzles 补货。

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  ALERT_WEBHOOK_URL?: string;
  MANUAL_TRIGGER_TOKEN?: string;
  LOOKAHEAD_DAYS?: string;
  INVENTORY_ALERT_THRESHOLD?: string;
}

interface PipelineValue {
  type: "null" | "integer" | "float" | "text";
  value?: string;
}

interface PipelineResult {
  cols: Array<{ name: string }>;
  rows: PipelineValue[][];
  affected_row_count?: number;
}

type Row = Record<string, string | number | null>;

const DEFAULT_LOOKAHEAD_DAYS = 3;
const DEFAULT_INVENTORY_ALERT_THRESHOLD = 4;

function encodeValue(value: unknown): PipelineValue {
  if (value === null || value === undefined) {
    return { type: "null" };
  }

  if (typeof value === "boolean") {
    return { type: "integer", value: value ? "1" : "0" };
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { type: "integer", value: String(value) }
      : { type: "float", value: String(value) };
  }

  return { type: "text", value: String(value) };
}

function decodeValue(value: PipelineValue): string | number | null {
  if (!value || value.type === "null") {
    return null;
  }

  if (value.type === "integer" || value.type === "float") {
    return Number(value.value);
  }

  return value.value ?? null;
}

function mapRows(result: PipelineResult): Row[] {
  const cols = (result.cols ?? []).map((col) => String(col.name));

  return (result.rows ?? []).map((values) => {
    const row: Row = {};
    values.forEach((value, index) => {
      row[cols[index] ?? `col_${index}`] = decodeValue(value);
    });
    return row;
  });
}

async function callPipeline(env: Env, statements: Array<{ sql: string; args?: unknown[] }>): Promise<Row[][]> {
  const baseUrl = env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, "https://").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.TURSO_AUTH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        ...statements.map((stmt) => ({
          type: "execute",
          stmt: { sql: stmt.sql, args: (stmt.args ?? []).map(encodeValue), want_rows: true },
        })),
        { type: "close" },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Turso pipeline HTTP ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as { results?: Array<{ type: string; response?: { result?: PipelineResult }; error?: unknown }> };
  const results = payload.results ?? [];

  return statements.map((_, index) => {
    const entry = results[index];

    if (!entry || entry.type !== "ok") {
      throw new Error(`Turso pipeline statement ${index} failed: ${JSON.stringify(entry ?? payload)}`);
    }

    return mapRows(entry.response?.result ?? { cols: [], rows: [] });
  });
}

function utcDateKey(offsetDays: number): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays));
  return date.toISOString().slice(0, 10);
}

async function sendAlert(env: Env, message: string): Promise<void> {
  console.warn(`[Strands Cron] ALERT: ${message}`);

  if (!env.ALERT_WEBHOOK_URL) {
    return;
  }

  try {
    await fetch(env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `[wordless-strands-cron] ${message}` }),
    });
  } catch (error) {
    console.error("[Strands Cron] failed to send alert webhook:", error);
  }
}

interface DateAction {
  date: string;
  action: "skip" | "assigned" | "failed";
  puzzleId?: string;
  message?: string;
}

async function assignForDate(env: Env, date: string): Promise<DateAction> {
  const [existing] = await callPipeline(env, [
    { sql: "SELECT puzzle_id FROM daily_strands WHERE date = ? LIMIT 1", args: [date] },
  ]);

  if (existing.length > 0) {
    return { date, action: "skip", puzzleId: String(existing[0]?.puzzle_id) };
  }

  const [stock] = await callPipeline(env, [
    {
      sql: "SELECT id, theme, article FROM strands_puzzles WHERE used_at IS NULL ORDER BY created_at DESC LIMIT 1",
    },
  ]);

  const puzzle = stock[0];

  if (!puzzle) {
    return { date, action: "failed", message: "no stock puzzle available" };
  }

  const now = new Date().toISOString();
  await callPipeline(env, [
    { sql: "INSERT INTO daily_strands (date, puzzle_id, created_at) VALUES (?, ?, ?)", args: [date, puzzle.id, now] },
    { sql: "UPDATE strands_puzzles SET used_at = ? WHERE id = ?", args: [now, puzzle.id] },
  ]);

  if (!puzzle.article) {
    console.warn(`[Strands Cron] ${date}: assigned puzzle ${String(puzzle.id)} has no article`);
  }

  return { date, action: "assigned", puzzleId: String(puzzle.id) };
}

async function runAssignment(env: Env): Promise<{ actions: DateAction[]; inventory: number }> {
  const lookahead = Number.parseInt(env.LOOKAHEAD_DAYS ?? "", 10);
  const lookaheadDays = Number.isInteger(lookahead) && lookahead >= 0 ? lookahead : DEFAULT_LOOKAHEAD_DAYS;
  const actions: DateAction[] = [];

  for (let offset = 0; offset <= lookaheadDays; offset += 1) {
    const date = utcDateKey(offset);

    try {
      actions.push(await assignForDate(env, date));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Strands Cron] ${date}: failed — ${message}`);
      actions.push({ date, action: "failed", message });
    }
  }

  const [inventoryRows] = await callPipeline(env, [
    { sql: "SELECT COUNT(*) AS total FROM strands_puzzles WHERE used_at IS NULL" },
  ]);
  const inventory = Number(inventoryRows[0]?.total ?? 0);

  const threshold = Number.parseInt(env.INVENTORY_ALERT_THRESHOLD ?? "", 10);
  const alertThreshold = Number.isInteger(threshold) && threshold >= 0 ? threshold : DEFAULT_INVENTORY_ALERT_THRESHOLD;

  const failed = actions.filter((action) => action.action === "failed");
  if (failed.length > 0) {
    await sendAlert(env, `${failed.length} 个日期分配失败: ${failed.map((f) => `${f.date}(${f.message})`).join(", ")}`);
  }
  if (inventory < alertThreshold) {
    await sendAlert(env, `Strands 库存不足：剩余 ${inventory} 道（阈值 ${alertThreshold}），请尽快运行 pnpm db:generate-strands-puzzles 补货`);
  }

  return { actions, inventory };
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runAssignment(env).then((summary) => {
        console.log(`[Strands Cron] summary: ${JSON.stringify(summary)}`);
      }),
    );
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/run") {
      // 手动触发：配置了 MANUAL_TRIGGER_TOKEN 时要求 ?token= 匹配
      if (env.MANUAL_TRIGGER_TOKEN && url.searchParams.get("token") !== env.MANUAL_TRIGGER_TOKEN) {
        return new Response("forbidden", { status: 403 });
      }

      const summary = await runAssignment(env);
      return Response.json({ ok: true, ...summary });
    }

    return new Response("wordless-strands-cron: ok. POST/GET /run 手动触发一次分配。", { status: 200 });
  },
};
