-- Jabal Omar WhatsApp Business - initial schema

CREATE TABLE IF NOT EXISTS inquiry_categories (
    id          SERIAL PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    name_ar     TEXT NOT NULL,
    name_en     TEXT NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
    id             BIGSERIAL PRIMARY KEY,
    wa_id          TEXT NOT NULL UNIQUE,         -- WhatsApp user id / phone number (E.164 digits)
    display_name   TEXT,
    locale         TEXT,                          -- detected locale: ar, en, or null
    first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    opted_out      BOOLEAN NOT NULL DEFAULT FALSE,
    metadata       JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_contacts_last_seen ON contacts(last_seen_at);

CREATE TABLE IF NOT EXISTS conversations (
    id               BIGSERIAL PRIMARY KEY,
    contact_id       BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    category_code    TEXT REFERENCES inquiry_categories(code),
    state            TEXT NOT NULL DEFAULT 'new',  -- state machine state
    language         TEXT,                          -- ar or en
    status           TEXT NOT NULL DEFAULT 'open', -- open, closed, archived
    needs_human      BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_agent   TEXT,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_response_at TIMESTAMPTZ,
    last_message_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at      TIMESTAMPTZ,
    internal_notes   TEXT,
    tags             TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_state ON conversations(state);
CREATE INDEX IF NOT EXISTS idx_conversations_started_at ON conversations(started_at);

CREATE TABLE IF NOT EXISTS messages (
    id                 BIGSERIAL PRIMARY KEY,
    conversation_id    BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    wa_message_id      TEXT UNIQUE,                  -- WhatsApp wamid for dedup
    direction          TEXT NOT NULL,                -- inbound, outbound
    message_type       TEXT NOT NULL,                -- text, interactive, template, image, etc.
    body               TEXT,
    payload            JSONB NOT NULL DEFAULT '{}'::jsonb,
    status             TEXT,                         -- sent, delivered, read, failed, received
    error              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

CREATE TABLE IF NOT EXISTS leads (
    id               BIGSERIAL PRIMARY KEY,
    conversation_id  BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    contact_id       BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    category_code    TEXT NOT NULL REFERENCES inquiry_categories(code),
    full_name        TEXT,
    contact_number   TEXT,
    email            TEXT,
    -- hotel
    stay_dates       TEXT,
    number_of_guests INT,
    -- retail
    business_type    TEXT,
    unit_type        TEXT,
    -- vendor
    company_name     TEXT,
    service_type     TEXT,
    -- general
    notes            TEXT,
    raw_fields       JSONB NOT NULL DEFAULT '{}'::jsonb,
    status           TEXT NOT NULL DEFAULT 'new', -- new, contacted, won, lost
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category_code);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

CREATE TABLE IF NOT EXISTS handoff_events (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    triggered_by    TEXT NOT NULL, -- user, bot, agent
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handoff_conversation ON handoff_events(conversation_id);

CREATE TABLE IF NOT EXISTS webhook_events (
    id           BIGSERIAL PRIMARY KEY,
    event_id     TEXT UNIQUE,       -- wamid or message id used for dedup
    payload      JSONB NOT NULL,
    received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed    BOOLEAN NOT NULL DEFAULT FALSE,
    error        TEXT
);

CREATE TABLE IF NOT EXISTS weekly_reports (
    id              BIGSERIAL PRIMARY KEY,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    metrics         JSONB NOT NULL,
    markdown        TEXT NOT NULL,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(period_start, period_end)
);
