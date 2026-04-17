import { query } from "../db/pool";

export async function wasEventProcessed(eventId: string): Promise<boolean> {
  const { rows } = await query<{ processed: boolean }>(
    `SELECT processed FROM webhook_events WHERE event_id = $1`,
    [eventId]
  );
  return rows.length > 0 && rows[0].processed === true;
}

export async function recordWebhookEvent(
  eventId: string | null,
  payload: unknown
): Promise<{ inserted: boolean; id: number | null }> {
  if (!eventId) {
    // Always insert with null event_id (no dedup available)
    const { rows } = await query<{ id: number }>(
      `INSERT INTO webhook_events (event_id, payload) VALUES (NULL, $1::jsonb) RETURNING id`,
      [JSON.stringify(payload)]
    );
    return { inserted: true, id: rows[0].id };
  }
  const { rows } = await query<{ id: number }>(
    `INSERT INTO webhook_events (event_id, payload) VALUES ($1, $2::jsonb)
     ON CONFLICT (event_id) DO NOTHING
     RETURNING id`,
    [eventId, JSON.stringify(payload)]
  );
  return { inserted: rows.length > 0, id: rows[0]?.id ?? null };
}

export async function markWebhookProcessed(id: number, error?: string): Promise<void> {
  await query(
    `UPDATE webhook_events SET processed = TRUE, error = $2 WHERE id = $1`,
    [id, error ?? null]
  );
}
