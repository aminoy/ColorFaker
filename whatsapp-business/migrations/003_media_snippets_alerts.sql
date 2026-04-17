-- 003: inbound media, canned replies (snippets), SLA breach notifications ledger.

-- --- messages: track media + location ---------------------------
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS media_id      TEXT,
    ADD COLUMN IF NOT EXISTS media_mime    TEXT,
    ADD COLUMN IF NOT EXISTS media_filename TEXT,
    ADD COLUMN IF NOT EXISTS media_caption TEXT,
    ADD COLUMN IF NOT EXISTS location_lat  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_lng  DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_name TEXT,
    ADD COLUMN IF NOT EXISTS location_address TEXT;

-- --- canned replies (operator snippets) -------------------------
CREATE TABLE IF NOT EXISTS canned_replies (
    id             BIGSERIAL PRIMARY KEY,
    code           TEXT NOT NULL,                  -- /hotel_dates, /vendor_link ...
    language       TEXT NOT NULL CHECK (language IN ('ar','en')),
    title          TEXT NOT NULL,
    body           TEXT NOT NULL,
    category_code  TEXT REFERENCES inquiry_categories(code),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(code, language)
);
CREATE INDEX IF NOT EXISTS idx_canned_category ON canned_replies(category_code);

-- --- SLA breach notifications ledger (dedup by conversation+kind) ---
CREATE TABLE IF NOT EXISTS sla_breach_events (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    kind            TEXT NOT NULL CHECK (kind IN ('first_response','resolution')),
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified_at     TIMESTAMPTZ,
    delivery_status TEXT,
    UNIQUE(conversation_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_sla_breach_conv ON sla_breach_events(conversation_id);
