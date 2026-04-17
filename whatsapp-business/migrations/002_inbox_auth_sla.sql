-- 002: Operator inbox, SLA, follow-ups, audit, CRM sync, outbound queue, AI suggestions.

-- ---------------------------------------------------------------
-- Conversation schema extensions
-- ---------------------------------------------------------------
ALTER TABLE conversations
    ADD COLUMN IF NOT EXISTS priority          TEXT NOT NULL DEFAULT 'normal',   -- low|normal|high|urgent
    ADD COLUMN IF NOT EXISTS assignee_id       BIGINT,                           -- users.id
    ADD COLUMN IF NOT EXISTS team_id           BIGINT,                           -- teams.id
    ADD COLUMN IF NOT EXISTS first_response_due_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolution_due_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS unread_count      INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_customer_message_at TIMESTAMPTZ;

-- Broader status set: old 'open/closed/archived' + operational states.
-- We keep the string column but document the expanded vocabulary:
--   new | bot_handled | pending_human | in_progress | waiting_on_customer | resolved | archived

CREATE INDEX IF NOT EXISTS idx_conversations_assignee ON conversations(assignee_id);
CREATE INDEX IF NOT EXISTS idx_conversations_priority ON conversations(priority);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- ---------------------------------------------------------------
-- Users, teams, roles
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS teams (
    id           BIGSERIAL PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL PRIMARY KEY,
    email            TEXT NOT NULL UNIQUE,
    display_name     TEXT NOT NULL,
    password_hash    TEXT NOT NULL,
    role             TEXT NOT NULL CHECK (role IN ('admin','manager','agent','viewer')),
    team_id          BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at    TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add the missing FK from conversations now that users exists.
ALTER TABLE conversations
    ADD CONSTRAINT conversations_assignee_fk
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    NOT VALID;

ALTER TABLE conversations
    ADD CONSTRAINT conversations_team_fk
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
    NOT VALID;

-- ---------------------------------------------------------------
-- Structured notes + assignment history
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversation_notes (
    id               BIGSERIAL PRIMARY KEY,
    conversation_id  BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    author_user_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    body             TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_conversation ON conversation_notes(conversation_id);

CREATE TABLE IF NOT EXISTS assignments (
    id               BIGSERIAL PRIMARY KEY,
    conversation_id  BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    assignee_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    team_id          BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    assigned_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reason           TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_assignments_conversation ON assignments(conversation_id);

-- Author column on messages so we can show "sent by Agent X" in the timeline.
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------
-- SLA rules + audit + follow-ups + CRM + outbound queue
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sla_rules (
    id                          BIGSERIAL PRIMARY KEY,
    category_code               TEXT REFERENCES inquiry_categories(code),
    priority                    TEXT,                           -- nullable = any priority
    first_response_minutes      INT NOT NULL,
    resolution_minutes          INT NOT NULL,
    description                 TEXT,
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sla_rules_category ON sla_rules(category_code, priority);

CREATE TABLE IF NOT EXISTS follow_ups (
    id                BIGSERIAL PRIMARY KEY,
    conversation_id   BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    owner_user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    due_at            TIMESTAMPTZ NOT NULL,
    note              TEXT,
    status            TEXT NOT NULL DEFAULT 'pending',   -- pending|done|cancelled
    completed_at      TIMESTAMPTZ,
    created_by        BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_followups_due ON follow_ups(due_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_followups_owner ON follow_ups(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_followups_conversation ON follow_ups(conversation_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id            BIGSERIAL PRIMARY KEY,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    actor_email   TEXT,
    event         TEXT NOT NULL,     -- login, login_failed, logout, reply_sent, assignment_changed, note_created, status_changed, priority_changed, follow_up_created, crm_sync, ai_suggestion_viewed, ...
    entity_type   TEXT,              -- conversation|lead|user|...
    entity_id     BIGINT,
    metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip            TEXT,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

CREATE TABLE IF NOT EXISTS crm_sync_logs (
    id                BIGSERIAL PRIMARY KEY,
    lead_id           BIGINT REFERENCES leads(id) ON DELETE CASCADE,
    conversation_id   BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    adapter           TEXT NOT NULL,
    status            TEXT NOT NULL,      -- queued|success|failed|abandoned
    attempt           INT NOT NULL DEFAULT 0,
    external_id       TEXT,
    request           JSONB NOT NULL DEFAULT '{}'::jsonb,
    response          JSONB NOT NULL DEFAULT '{}'::jsonb,
    error             TEXT,
    next_retry_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_status ON crm_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_crm_next_retry ON crm_sync_logs(next_retry_at) WHERE status = 'failed';

-- Outbound message queue (for rate-limit-friendly sending + 24h window handling).
CREATE TABLE IF NOT EXISTS outbound_queue (
    id                 BIGSERIAL PRIMARY KEY,
    conversation_id    BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    contact_wa_id      TEXT NOT NULL,
    kind               TEXT NOT NULL,        -- text|template|interactive
    body               TEXT,
    template_name      TEXT,
    template_language  TEXT,
    template_variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    payload            JSONB NOT NULL DEFAULT '{}'::jsonb,
    requested_by_user  BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status             TEXT NOT NULL DEFAULT 'queued',  -- queued|sent|failed|abandoned|waiting_24h
    attempts           INT NOT NULL DEFAULT 0,
    last_error         TEXT,
    last_error_code    TEXT,
    wa_message_id      TEXT,
    scheduled_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at            TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_queue_status ON outbound_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_ready ON outbound_queue(scheduled_at) WHERE status = 'queued';

-- AI suggestions cache (for audit + avoiding duplicate calls).
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL,    -- reply|summary|category|priority|escalation
    language        TEXT,
    content         TEXT NOT NULL,
    meta            JSONB NOT NULL DEFAULT '{}'::jsonb,
    model           TEXT,
    requested_by    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_conversation ON ai_suggestions(conversation_id, kind);
