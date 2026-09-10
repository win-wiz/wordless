# wordless-strands-cron

Strands 每日题分配的 Cloudflare Cron Worker。每天 UTC 00:05（北京时间 08:05）触发，
从 Turso `strands_puzzles` 库存（`used_at IS NULL`，最新创建优先）取题写入 `daily_strands`，
覆盖今天起 `LOOKAHEAD_DAYS`（默认 3）天内未排期的日期，并把题目的 `used_at` 标记掉。

**职责边界**：只做分配，不做 LLM 生成。库存不足（< `INVENTORY_ALERT_THRESHOLD`，默认 4）
或分配失败时，向 `ALERT_WEBHOOK_URL` POST `{"text": ...}` 告警；补货请运行
`pnpm db:generate-strands-puzzles` 后用 `scripts/sync-local-db-to-turso.js` 同步到 Turso。
本地等价脚本是 `pnpm db:assign-daily-strands`（多了现场生成/补文章的重逻辑）。

## 配置

密钥（`wrangler secret put`，勿写入 wrangler.toml）：

| Secret | 必需 | 说明 |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | 是 | Turso 库地址，支持 `libsql://` 或 `https://` |
| `TURSO_AUTH_TOKEN` | 是 | Turso 访问令牌 |
| `ALERT_WEBHOOK_URL` | 否 | 库存告警 webhook（Slack/Discord 兼容格式） |
| `MANUAL_TRIGGER_TOKEN` | 否 | 配置后 `/run?token=...` 需要匹配，防止公开触发 |

`LOOKAHEAD_DAYS`、`INVENTORY_ALERT_THRESHOLD` 在 `wrangler.toml` 的 `[vars]` 中调整。

## 常用命令

```bash
pnpm strands-cron:dev        # 本地调试（读取 .dev.vars）
pnpm strands-cron:typecheck  # 类型检查
pnpm strands-cron:deploy     # 部署到 Cloudflare
```

手动触发一次分配（线上）：

```bash
curl "https://wordless-strands-cron.<account>.workers.dev/run?token=$MANUAL_TRIGGER_TOKEN"
```

分配是幂等的：已排期的日期会跳过，重复触发不会重复写。
