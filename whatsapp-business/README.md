# Jabal Omar WhatsApp Business Platform

A production-ready WhatsApp management system for **Jabal Omar Development Company** built on the official [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).

It handles incoming messages, auto-replies in Arabic (with English fallback), routes
inquiries by category (hotel booking, retail leasing, vendors, general), captures
leads in a normalized database schema, supports human handoff, and produces weekly
analytics reports in CSV, JSON, and Markdown.

---

## 1. Stack

| Layer          | Choice                                           |
| -------------- | ------------------------------------------------ |
| Runtime        | Node.js 20 + TypeScript                          |
| HTTP           | Express 4                                        |
| Validation     | Zod                                              |
| DB             | PostgreSQL 16 (via `pg` pool)                    |
| Scheduler      | `node-cron`                                      |
| Logging        | `pino` (JSON in prod, pretty in dev)             |
| HTTP client    | `axios` with exponential-backoff retries         |
| Containerization| Docker + docker-compose                         |
| Tests          | Jest + ts-jest                                   |

---

## 2. Project structure

```
whatsapp-business/
├── src/
│   ├── config/          # env + logger
│   ├── controllers/     # HTTP handlers (thin)
│   ├── routes/          # Express routers
│   ├── services/        # Business logic (WA client, intent, lead extraction, templates, signature)
│   ├── state/           # Pure conversation state machine
│   ├── models/          # DB repositories (contacts, conversations, messages, leads, handoff, events)
│   ├── db/              # pg pool, migrations runner, seed runner
│   ├── jobs/            # Scheduler + weekly report runner
│   ├── reporting/       # Metrics SQL + CSV/JSON/Markdown formatters
│   ├── middleware/      # Raw-body capture (for HMAC)
│   ├── types/           # Shared domain types
│   └── server.ts        # Entry point
├── migrations/          # SQL migrations (001_init.sql)
├── seeds/               # 001_seed.sql (inquiry categories)
├── tests/
│   ├── unit/            # Jest tests (state machine, intent, reporting, signature, parser, ...)
│   └── fixtures/        # Sample webhook payloads
├── scripts/             # generateSampleReport.ts
├── reports/             # Weekly CSV/JSON/MD outputs
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 3. Setup

### 3.1 Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14 (or just run `docker compose up db`)
- A Meta developer account with a WhatsApp Business App and a test/phone number ID

### 3.2 Install & run locally

```bash
cp .env.example .env
# Edit .env and fill in the WhatsApp credentials (see section 4).
npm install
docker compose up -d db                # or point DATABASE_URL at your own PG
npm run migrate
npm run seed
npm run dev
```

The server starts on `http://localhost:3000`.

Health checks:
```
GET /healthz   # liveness
GET /readyz    # verifies DB connectivity
```

### 3.3 Run in Docker

```bash
docker compose up --build
```

The `app` service runs migrations automatically before starting (`node dist/db/migrate.js && node dist/server.js`).

---

## 4. WhatsApp Cloud API configuration

Get these from the [Meta Developer Console](https://developers.facebook.com/apps/):

| Env var                          | Where to find it                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `WHATSAPP_ACCESS_TOKEN`          | App → WhatsApp → API Setup → **Temporary access token** (use System User long-lived in prod)      |
| `WHATSAPP_PHONE_NUMBER_ID`       | App → WhatsApp → API Setup → Phone number ID                                                      |
| `WHATSAPP_BUSINESS_ACCOUNT_ID`   | App → WhatsApp → API Setup → WABA ID                                                              |
| `WHATSAPP_API_VERSION`           | e.g. `v20.0`                                                                                       |
| `WHATSAPP_VERIFY_TOKEN`          | Any random string — mirror it in Meta webhook config                                              |
| `WHATSAPP_APP_SECRET`            | App → Settings → Basic → **App Secret** (used to validate `X-Hub-Signature-256`)                   |

### Webhook setup in Meta Console

1. Public-ingress your app (see §7). The webhook URL is `https://<your-host>/webhook`.
2. In the Meta app console → WhatsApp → Configuration → Edit webhook:
   - **Callback URL:** `https://<your-host>/webhook`
   - **Verify token:** matches `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to **messages** (and `message_status` if you want delivery/read receipts).
3. Send a test message from WhatsApp — you should see `http.request` entries in the logs.

---

## 5. Functional behaviour

### Inbound flow

1. On the **first** message from a new contact, reply with a bilingual welcome menu (Arabic first, English fallback).
2. User selects a category:
   - `1` or keywords → **hotel_booking**
   - `2` or keywords → **retail_leasing**
   - `3` or keywords → **vendor** (also sends the vendor portal link)
   - `4` or keywords → **general_inquiry**
3. The bot acknowledges, tags the conversation, and starts extracting lead fields from free-text (phone, name, email, guests, dates, business type, etc.).
4. If the user says "complaint", "human", "مشكلة", "موظف"… the bot sets `needs_human = true`, sends a handoff notice, and records a `handoff_events` row.

### State machine

All transitions are in `src/state/stateMachine.ts` as a **pure function** — easy to reason about and unit-test.

States: `new`, `awaiting_category`, `collecting_hotel`, `collecting_retail`, `collecting_vendor`, `collecting_general`, `handed_off`, `resolved`.

### Retry-safe outbound messaging

`WhatsAppClient.postWithRetry` retries on 5xx / network errors with exponential backoff (500ms → 8s, 4 attempts). 4xx errors fail fast.

### Webhook safety

- `X-Hub-Signature-256` is validated against the **raw request body** using a constant-time compare (`src/services/signature.ts`).
- Webhook events are deduplicated by `wamid` through the `webhook_events` table.
- Messages are dedup-persisted via a `UNIQUE(wa_message_id)` on `messages`.
- We respond `200 OK` immediately, then process asynchronously — so Meta never retries just because our handler is slow.
- Basic rate limiting on `POST /webhook` (configurable window / max).

---

## 6. Database schema

See `migrations/001_init.sql`. Normalized tables:

- `inquiry_categories` — static lookup (`hotel_booking`, `retail_leasing`, `vendor`, `general_inquiry`)
- `contacts` — one row per WhatsApp user (`wa_id` unique)
- `conversations` — one open conversation per contact at a time; carries state, tags, category, needs_human, notes
- `messages` — inbound + outbound; `wa_message_id` unique for dedup
- `leads` — structured lead per conversation (one row, upserted as more fields arrive)
- `handoff_events` — audit trail of every escalation
- `webhook_events` — raw webhook dedup + audit log
- `weekly_reports` — persisted metrics per period

### Migrations / seeds

```bash
npm run migrate      # idempotent; tracks applied migrations in schema_migrations
npm run seed         # inserts inquiry categories + a test contact
```

Add a new migration by dropping a `NNN_name.sql` file in `migrations/` — they are applied in lexical order.

---

## 7. Weekly analytics

Runs via cron (default: `0 7 * * 1` in `Asia/Riyadh`, i.e. Mondays 07:00) computing the previous Monday→Monday window.

Metrics include:
- Total conversations (+ new vs returning contact split)
- Conversations by category
- Avg first response time, avg resolution time
- Handoff count + rate
- Leads by category
- Top active days + hours
- Arabic / English / undetected language split

Outputs are written to `REPORT_OUTPUT_DIR` (default `./reports/`) and persisted in `weekly_reports`:

- `weekly-YYYY-MM-DD_YYYY-MM-DD.csv`
- `weekly-YYYY-MM-DD_YYYY-MM-DD.json`
- `weekly-YYYY-MM-DD_YYYY-MM-DD.md`

### Run manually

```bash
npm run report:weekly
```

### Generate a sample (no DB)

```bash
npx ts-node scripts/generateSampleReport.ts
```

See `reports/sample-weekly.{csv,json,md}`.

---

## 8. Admin endpoints

*Read-only and unauthenticated by default — put them behind nginx/Cloudflare Access / API key in production.*

```
GET  /admin/leads?category=hotel_booking&limit=50
GET  /admin/conversations?needs_human=true
POST /admin/conversations/:id/note   {"note":"Called back at 15:00"}
```

---

## 9. Testing

```bash
npm test                     # 39 unit tests: intent, state machine, lead extraction,
                             # language detection, signature, webhook parser, report formatters
npm run lint                 # tsc --noEmit
```

Tests that touch a real DB are intentionally *not* included — the models are thin SQL wrappers, and the reporting SQL is verified by running `npm run report:weekly` against a seeded DB. See §10.3 for sample end-to-end verification.

---

## 10. Deployment

### 10.1 Suggested topology

- **App**: 2× containers behind a load balancer (HTTP/2 terminating at LB; plain HTTP inside).
- **Database**: managed Postgres (RDS / Cloud SQL) with PITR.
- **Webhook ingress**: Cloudflare / ALB with HTTPS-only + IP allowlist for Meta if desired.
- **Secrets**: AWS Secrets Manager / GCP Secret Manager; never bake into images.
- **Observability**: ship `pino` JSON logs to CloudWatch / Stackdriver / ELK. Alert on `webhook.signature_invalid`, `webhook.handle_failed`, and non-2xx rate on `/webhook`.
- **Scheduler**: Weekly cron runs inside the container. For HA, disable the internal scheduler (`WEEKLY_REPORT_CRON=`) and run `npm run report:weekly` from a dedicated job (EventBridge, K8s CronJob).

### 10.2 Production checklist

- [ ] `NODE_ENV=production`
- [ ] `WHATSAPP_APP_SECRET` and `WHATSAPP_VERIFY_TOKEN` populated from secret manager
- [ ] Webhook URL registered and verified in Meta console
- [ ] Rate limit tuned (`WEBHOOK_RATE_LIMIT_*`)
- [ ] Database backups + migration plan
- [ ] Admin routes protected by auth proxy
- [ ] Alerting on error rates & failed outbound messages
- [ ] Log retention + PII policy (messages contain personal data)

### 10.3 Smoke test

```bash
# 1. Bring up the stack
docker compose up --build

# 2. Simulate a webhook (valid signature required)
node - <<'JS'
const fs = require('fs');
const crypto = require('crypto');
const body = fs.readFileSync('tests/fixtures/inbound-text-arabic.json');
const sig = 'sha256=' + crypto.createHmac('sha256', process.env.WHATSAPP_APP_SECRET).update(body).digest('hex');
console.log('curl -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -H "X-Hub-Signature-256: ' + sig + '" --data-binary @tests/fixtures/inbound-text-arabic.json');
JS
```

---

## 11. Security & compliance notes

- No secrets in the repo; all credentials come from env vars (validated by Zod at boot).
- HMAC validation on every inbound webhook (constant-time compare).
- Raw body is captured **before** JSON parsing so we hash the byte-exact payload.
- Rate limiting on `/webhook`.
- All significant state changes log structured events with `pino`, suitable for audit queries.
- `redact` rules in the logger mask `Authorization` headers and tokens.
- No outbound call returns unvalidated user input directly.
- PII lives in `contacts` and `leads` — add a retention cron matching your DPO policy before production (not included by default).

---

## 12. Future enhancements

Roadmap suggestions:

1. **CRM integration** — sync `leads` to Salesforce / HubSpot via a background worker (Kafka or BullMQ).
2. **Dashboard UI** — small Next.js admin app backed by `/admin/*` endpoints.
3. **Agent inbox** — live conversation view with ability to send replies from the dashboard.
4. **SLA alerts** — if `first_response_at` > target or a `needs_human=true` conversation is idle >15min, notify ops via Slack/SMS.
5. **Campaign source tracking** — add `utm_source` to `conversations` using WhatsApp click-to-chat links (`wa.me?text=...`).
6. **AI-assisted replies** — plug Anthropic Claude (via the Anthropic SDK) behind `services/conversationService.ts` to draft personalized acknowledgements while keeping the state machine deterministic.
7. **Template messages** for outbound reactivation outside the 24h service window.
8. **Language auto-learning** — use message history to refine the keyword dictionary.

---

## 13. Missing credentials & placeholders to fill

The `.env.example` uses placeholders. Before production:

- `WHATSAPP_ACCESS_TOKEN` — generate a long-lived System User token.
- `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` — from Meta console.
- `WHATSAPP_APP_SECRET` — from App Settings.
- `WHATSAPP_VERIFY_TOKEN` — generate a random 32-byte string and register it in Meta.
- `DATABASE_URL` — point at a managed Postgres.
- Admin auth — decide on an auth layer for `/admin/*` (not wired, by design).

Everything else has sensible defaults and the app will boot end-to-end with placeholders (though actual outbound messages will of course fail without a real token).

---

## License

Internal — © Jabal Omar Development Company.
