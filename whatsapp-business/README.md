# Jabal Omar WhatsApp Business Platform

A production-ready WhatsApp management system for **Jabal Omar Development Company** built on the official [WhatsApp Business Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).

The platform is an **operational product**, not just a backend:

- **Backend** (Node.js + TypeScript + Express + PostgreSQL): webhook handling, Arabic-first auto-replies, category routing, lead capture, 24-hour service-window logic, template-fallback, retry-safe outbound queue, CRM sync abstraction, AI-assisted drafting (human-in-the-loop only), SLA tracking, follow-ups, audit logging, weekly analytics.
- **Internal operator web app** (React + TypeScript + Vite, RTL-aware, AR/EN): secure login (JWT + CSRF double-submit), role-based access, inbox with filters + search + thread view + reply composer + notes + tags + assignments + priority flags + lead panel, management dashboard, follow-ups, SLA-breach board, audit log, user management.

---

## 1. Architecture at a glance

```
whatsapp-business/
├── src/                          # Backend (Node 20 + TS)
│   ├── config/                   # env (Zod-validated) + logger (pino)
│   ├── controllers/              # webhook controller
│   ├── routes/
│   │   ├── webhook.ts            # POST/GET /webhook (HMAC-validated)
│   │   ├── auth.ts               # /auth/login, /logout, /me
│   │   ├── api.ts                # /api/* — authenticated inbox + dashboard + admin
│   │   ├── admin.ts              # (legacy, superseded by /api)
│   │   └── health.ts             # /healthz, /readyz
│   ├── services/
│   │   ├── whatsappClient.ts     # text + template + interactive + raw send
│   │   ├── whatsappErrors.ts     # classify Meta error codes
│   │   ├── serviceWindow.ts      # 24h customer-service window logic
│   │   ├── outboundQueue.ts      # queue worker, retries, backoff, template fallback
│   │   ├── intent.ts / templates.ts / language.ts / leadExtraction.ts
│   │   ├── conversationService.ts # orchestrator
│   │   ├── auth.ts + audit.ts    # bcrypt + JWT + structured audit
│   │   ├── sla.ts                # deadline computation + risk query
│   │   ├── aiAssist.ts           # suggestions (Anthropic + heuristic fallback)
│   │   └── crm/                  # adapter interface + mock + webhook + dispatcher
│   ├── state/stateMachine.ts     # pure conversation FSM
│   ├── models/                   # thin SQL repositories
│   ├── middleware/               # rawBody + auth + RBAC + CSRF guard
│   ├── reporting/                # weekly metrics + dashboard metrics + formatters
│   ├── jobs/                     # schedulers (weekly report, CRM retry)
│   └── server.ts                 # entry
├── web/                          # Internal operator console (React + TS + Vite)
│   └── src/{App,pages,api,i18n}  # Inbox, Dashboard, Follow-ups, SLA, Audit, Users
├── migrations/
│   ├── 001_init.sql              # contacts, conversations, messages, leads, handoff, weekly_reports
│   └── 002_inbox_auth_sla.sql    # users, teams, assignments, notes, sla_rules, follow_ups,
│                                 # audit_logs, crm_sync_logs, outbound_queue, ai_suggestions
├── seeds/                        # categories, teams, SLA rules (users seeded by src/db/seed.ts)
├── tests/                        # 70 unit tests (see §9)
├── Dockerfile                    # multi-stage: builds web + backend, runs migrations + seeds
├── docker-compose.yml
└── .env.example
```

### How a message flows

1. Customer sends a WhatsApp message → Meta POSTs to `/webhook`.
2. HMAC signature is validated against the raw body (`src/services/signature.ts`).
3. 200 OK acked immediately; payload parsed and each message deduped (`webhook_events.event_id`, `messages.wa_message_id` both unique).
4. `conversationService.handleInboundText` runs:
   - upserts the contact
   - detects language, intent, handoff triggers
   - runs the pure state machine (`src/state/stateMachine.ts`)
   - persists inbound message + updates operational status + tags + SLA deadlines
   - upserts the structured lead and fires an async CRM sync
   - enqueues any auto-reply through the **outbound queue** (never sends inline)
5. The outbound worker picks up queued rows, respects the 24-hour window, falls back to an approved template if configured, classifies Meta errors, and retries with exponential backoff.

### How an operator works

1. Operator signs in at the React console (`/auth/login`) — bcrypt + JWT in httpOnly cookie + CSRF double-submit cookie.
2. Inbox polls `/api/inbox` with filters (category, status, assignee, priority, date range, handoff, unread) + full-text search over contact name, phone, company name, message body.
3. Selecting a conversation loads its timeline, lead, notes, assignments, follow-ups, and service-window status.
4. Replies are **queued**, not sent inline — the worker handles 24h window / templates / rate limits.
5. AI-suggested replies are drafted into the composer but never auto-sent; every suggestion view is recorded in `audit_logs`.
6. Every mutating action (reply, status change, priority change, assignment, note creation, follow-up creation, user creation) is written to `audit_logs`.

---

## 2. Local setup

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14 (or use `docker compose up -d db`)
- A Meta developer app with WhatsApp Business API access

### Bootstrap

```bash
# Backend
cd whatsapp-business
cp .env.example .env
npm install
docker compose up -d db
npm run migrate
npm run seed          # seeds categories, teams, SLA rules, demo users
npm run dev           # http://localhost:3000

# Operator console (separate terminal, proxies to backend)
cd web
npm install
npm run dev           # http://localhost:5173
```

The seed inserts four demo users (password `changeme123`, configurable via `SEED_DEFAULT_PASSWORD`):

| Email                        | Role    |
| ---------------------------- | ------- |
| admin@jabalomar.local        | admin   |
| manager@jabalomar.local      | manager |
| agent@jabalomar.local        | agent   |
| viewer@jabalomar.local       | viewer  |

Role capabilities:

| Action                          | admin | manager | agent | viewer |
| ------------------------------- | :---: | :-----: | :---: | :----: |
| Read inbox + dashboard          |   ✓   |    ✓    |   ✓   |    ✓   |
| Reply / add notes / change tags |   ✓   |    ✓    |   ✓   |        |
| Change status / priority        |   ✓   |    ✓    |   ✓   |        |
| Assign conversations            |   ✓   |    ✓    |       |        |
| Create users                    |   ✓   |         |       |        |
| View audit log                  |   ✓   |    ✓    |       |        |
| View CRM logs / retry           |   ✓   |    ✓    |       |        |

### Docker (one-shot)

```bash
docker compose up --build
# Waits for Postgres, then migrates, seeds, starts server on :3000 with the
# compiled web console served from the same origin.
```

---

## 3. WhatsApp Cloud API configuration

Same as v1, plus new operational settings. See `.env.example` for all env vars.

Key new variables:

| Env var                            | Purpose                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `WHATSAPP_SERVICE_WINDOW_HOURS`    | How long the free-form window stays open (Meta default: 24 hours).                                   |
| `WHATSAPP_DEFAULT_TEMPLATE_NAME`   | Approved template name used when the window closes. If blank, outbound is parked as `waiting_24h`.   |
| `WHATSAPP_DEFAULT_TEMPLATE_LANG`   | Template language code (`ar`, `en_US`, etc.).                                                        |
| `OUTBOUND_QUEUE_POLL_MS`           | How often the queue worker drains.                                                                   |
| `OUTBOUND_MAX_ATTEMPTS`            | Max attempts before a message is abandoned.                                                          |
| `JWT_SECRET`                       | **REQUIRED in prod.** 32+ byte random.                                                               |
| `AUTH_COOKIE_SECURE`               | Set to `true` when serving over HTTPS.                                                               |
| `CRM_ADAPTER`                      | `mock` (dev) · `webhook` (generic) · `disabled`.                                                     |
| `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_AUTH_HEADER` | Target + auth for the generic webhook adapter.                                              |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Optional — enables Claude-backed suggestions. Blank ⇒ local heuristic fallback.                   |

---

## 4. Database schema

Normalized and extended. See `migrations/001_init.sql` + `migrations/002_inbox_auth_sla.sql`.

Tables:

- **contacts** — WhatsApp users
- **conversations** — state, operational status, priority, assignee, team, SLA deadlines, unread counter
- **messages** — inbound + outbound (`wa_message_id` unique, `author_user_id` for agent replies)
- **leads** — structured lead fields (upserted per conversation)
- **inquiry_categories** — static lookup
- **handoff_events** — audit trail
- **webhook_events** — inbound dedup + audit
- **weekly_reports** — persisted weekly metrics
- **users**, **teams** — operator accounts + grouping
- **conversation_notes** — structured internal notes with author FK
- **assignments** — assignment history (who / when / by / reason)
- **sla_rules** — per category + priority, with `is_active` flag
- **follow_ups** — reminders with owner, due time, status
- **audit_logs** — every significant operator action (login, reply_sent, assignment_changed, note_created, status_changed, priority_changed, follow_up_created, ai_suggestion_viewed, user_created, …)
- **crm_sync_logs** — per-attempt CRM sync tracking with `next_retry_at`
- **outbound_queue** — rate-limit-friendly outbound send queue with `waiting_24h` + `abandoned` states
- **ai_suggestions** — cached AI suggestions for audit

---

## 5. Security

### Authentication + authorization

- bcrypt (cost 10) password hashing; passwords never logged.
- JWT signed with `JWT_SECRET` (HS256), stored in an **httpOnly, SameSite=Lax** cookie. `AUTH_COOKIE_SECURE=true` in prod.
- Alternative: `Authorization: Bearer <token>` header for machine clients.
- RBAC via `requireRole(...)` middleware (`admin`, `manager`, `agent`, `viewer`).
- CSRF: double-submit cookie (`jo_csrf`) mirrored to `X-CSRF-Token` header on unsafe requests. Bearer-token callers are exempt.
- Rate-limited login (`LOGIN_RATE_LIMIT_*`); failures are audited with IP/UA.

### Webhook

- HMAC `X-Hub-Signature-256` validated against the byte-exact raw body, constant-time compare.
- Raw-body capture happens **before** JSON parsing.
- Dedup on `wamid` prevents duplicate processing; fast 200 OK stops Meta retry storms.

### Audit log

Every one of these events is persisted in `audit_logs` with actor, IP, user-agent and metadata:

`login`, `login_failed`, `logout`, `user_created`, `reply_sent`, `status_changed`, `priority_changed`, `assignment_changed`, `note_created`, `follow_up_created`, `ai_suggestion_viewed`

The log is queryable at `/api/audit` (admin/manager only).

### Log redaction

`pino` redacts `Authorization` headers and tokens at the boundary.

---

## 6. SLA + follow-ups

- `sla_rules` — rows per (`category_code`, `priority`). Precedence: exact match ▸ category+null ▸ global.
- On category / priority change the deadlines are recomputed from `started_at` and persisted into `conversations.first_response_due_at` / `resolution_due_at`.
- `GET /api/sla/risks` lists all open conversations with minutes-until-due + breach flags.
- `follow_ups` records operator-scheduled reminders with an owner, due time, and `pending | done | cancelled` status. Overdue filter powers the dashboard callout and the Follow-ups page's "overdue" filter.

---

## 7. WhatsApp production compliance

- **24-hour service window**: `services/serviceWindow.ts` tracks `last_customer_message_at`. The outbound queue checks window status before sending free-form text.
- **Template fallback**: If the window is closed and `WHATSAPP_DEFAULT_TEMPLATE_NAME` is set, the queue automatically posts a templated message (with the originally intended text as a body variable, truncated to 60 chars). If no template is configured, the queued text is parked as `waiting_24h`.
- **Error classification**: `services/whatsappErrors.ts` maps Meta error codes to `retryable | rate_limited | expired_window | recipient_block | permanent`, driving sensible retry behaviour.
- **Retry-safe outbound**: exponential backoff (30s → 10min cap), capped attempts, permanent errors abandoned with a reason code.
- **Full auditability**: `outbound_queue` records status, attempts, last error code, `wa_message_id`, and every delivery-status webhook updates the corresponding `messages.status`.

---

## 8. CRM sync

- `CrmAdapter` interface + two adapters shipped:
  - `MockCrmAdapter` (default, in-memory; used by tests).
  - `WebhookCrmAdapter` — POSTs the `CrmLeadPayload` JSON to `CRM_WEBHOOK_URL` with optional auth header. Works with Zapier / Make / custom ingest.
- Syncs fire automatically when a lead is upserted.
- `crm_sync_logs` tracks attempts + `next_retry_at`; the background scheduler retries failed rows every 2 minutes using exponential backoff, capped at `CRM_RETRY_MAX` attempts (then marked `abandoned`).
- Admin can trigger `POST /api/crm/retry` manually.

---

## 9. Testing

```bash
npm test           # 70 unit tests — all green
npm run lint       # tsc --noEmit (backend)
cd web && npx tsc --noEmit && npx vite build
```

Test coverage spans:

- **Intent** + **language detection** + **lead extraction** (Arabic/English, diacritics, Arabic-Indic digits).
- **State machine** (new + awaiting + collecting + pivot + handoff).
- **HMAC signature** + **webhook parser** (text, interactive list, delivery statuses).
- **Auth** (bcrypt round-trip, JWT issue/verify, tamper rejection).
- **RBAC** (unauth / forbidden / pass).
- **SLA** (rule precedence, deadline arithmetic, active flag).
- **24h window** (no-inbound, open, expired, custom window length).
- **Meta error classification** (network, 131047, rate limit, 5xx, recipient block, permanent).
- **Outbound queue backoff** (monotonic + 10min cap).
- **CRM** (mock capture + simulated transient failures + backoff monotonicity).
- **Report formatters** (CSV/JSON/Markdown; week-boundary math).
- **Dashboard CSV** (escaping, empty rows).

---

## 10. HTTP surface (authenticated `/api/*` unless noted)

### Auth (public)

- `POST /auth/login` — body `{email, password}`. Sets cookie, returns `{token, csrf, user}`.
- `POST /auth/logout` — clears cookies.
- `GET /auth/me` — current user.

### Inbox + thread

- `GET  /api/inbox?category=&status=&priority=&assignee_id=&team_id=&needs_human=&unread=&start_date=&end_date=&search=&limit=&offset=`
- `GET  /api/conversations/:id` — full timeline + lead + notes + assignments + follow-ups + service window
- `POST /api/conversations/:id/read`
- `POST /api/conversations/:id/reply`                    `{body}`        (enqueues, respects 24h)
- `POST /api/conversations/:id/status`                   `{status}`
- `POST /api/conversations/:id/priority`                 `{priority}`
- `POST /api/conversations/:id/tags`                     `{tags}`
- `POST /api/conversations/:id/assign`                   `{assignee_id,team_id?,reason?}` (admin/manager)
- `POST /api/conversations/:id/notes`                    `{body}`
- `POST /api/conversations/:id/follow-ups`               `{owner_user_id,due_at,note?}`
- `POST /api/conversations/:id/ai-suggest`               `{kind,language?}` — `reply|summary|category|priority|escalation`

### Follow-ups

- `GET  /api/follow-ups?owner=me&overdue=true&status=pending`
- `POST /api/follow-ups/:id/complete`
- `POST /api/follow-ups/:id/cancel`

### SLA

- `GET /api/sla/rules`
- `GET /api/sla/risks`

### Dashboard + exports

- `GET /api/dashboard/overview`
- `GET /api/dashboard/categories`
- `GET /api/dashboard/team`
- `GET /api/dashboard/leads`
- `GET /api/dashboard/backlog`
- `GET /api/export/leads.csv`           (range via `?start=&end=`)
- `GET /api/export/conversations.csv`

### Users

- `GET  /api/users`
- `POST /api/users`                     `{email,display_name,password,role,team_id?}` (admin)
- `GET  /api/teams`

### Admin

- `GET  /api/outbound?status=queued|waiting_24h|abandoned|failed|sent`
- `GET  /api/crm/logs`
- `POST /api/crm/retry`
- `GET  /api/audit`

### Webhook + health (public)

- `GET /webhook` — Meta verification
- `POST /webhook` — HMAC-validated, deduped
- `GET /healthz`, `GET /readyz`

---

## 11. Deployment

Same topology as v1, plus:

- Terminate HTTPS at the load balancer; set `AUTH_COOKIE_SECURE=true`.
- Populate `JWT_SECRET` from a secret manager — rotation invalidates all sessions.
- The outbound worker is in-process by default. For horizontal scaling, run the web tier with `OUTBOUND_QUEUE_POLL_MS=0` (not implemented as a flag today — just comment out `startQueueWorker()` in `server.ts`) and run one dedicated worker container.
- Weekly report + CRM retry schedulers also run in-process; for multi-replica deployments, disable them on all but one replica or run as CronJobs.

---

## 12. What you still need to add / wire up

Credentials and integration decisions that still need to be supplied:

- **Meta WhatsApp credentials** (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`).
- **Approved re-engagement template name** in `WHATSAPP_DEFAULT_TEMPLATE_NAME` (create + submit for Meta review).
- **Production `JWT_SECRET`**, served from your secret manager.
- **CRM target** (`CRM_ADAPTER=webhook`, `CRM_WEBHOOK_URL`, `CRM_WEBHOOK_AUTH_HEADER`) or a custom adapter plugged into `services/crm/`.
- **Anthropic API key** (`ANTHROPIC_API_KEY`) if you want Claude-backed suggestions; otherwise the heuristic fallback runs without any external call.
- **Change the demo user passwords** (`SEED_DEFAULT_PASSWORD` + rotate `admin@jabalomar.local`).
- **Admin/TLS proxy decisions**: HTTPS termination, IP allowlist for `/webhook`, WAF.
- **Weekly-report delivery** (email/Slack) — currently only written to disk + persisted in `weekly_reports`.

---

## 13. Future roadmap (not yet implemented)

- Rich media replies (images, documents, location).
- Supervisor queue ownership + SLA escalations to Slack/SMS.
- Full text + vector search over `messages`.
- Campaign source tracking via `wa.me?text=...` click-through IDs.
- Per-team SLA rules, skill-based routing.
- Multi-tenant hardening.

---

## License

Internal — © Jabal Omar Development Company.
