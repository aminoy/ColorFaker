import { query, withTransaction } from "../db/pool";

export type QueueStatus = "queued" | "sent" | "failed" | "abandoned" | "waiting_24h";
export type QueueKind = "text" | "template" | "interactive";

export interface QueueRow {
  id: number;
  conversation_id: number;
  contact_wa_id: string;
  kind: QueueKind;
  body: string | null;
  template_name: string | null;
  template_language: string | null;
  template_variables: unknown;
  payload: Record<string, unknown>;
  requested_by_user: number | null;
  status: QueueStatus;
  attempts: number;
  last_error: string | null;
  last_error_code: string | null;
  wa_message_id: string | null;
  scheduled_at: Date;
  sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function enqueue(args: {
  conversationId: number;
  contactWaId: string;
  kind: QueueKind;
  body?: string | null;
  templateName?: string | null;
  templateLanguage?: string | null;
  templateVariables?: unknown[];
  payload?: Record<string, unknown>;
  requestedByUserId?: number | null;
  scheduledAt?: Date;
  status?: QueueStatus;
}): Promise<QueueRow> {
  const { rows } = await query<QueueRow>(
    `INSERT INTO outbound_queue
       (conversation_id, contact_wa_id, kind, body, template_name, template_language,
        template_variables, payload, requested_by_user, scheduled_at, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11)
     RETURNING *`,
    [
      args.conversationId,
      args.contactWaId,
      args.kind,
      args.body ?? null,
      args.templateName ?? null,
      args.templateLanguage ?? null,
      JSON.stringify(args.templateVariables ?? []),
      JSON.stringify(args.payload ?? {}),
      args.requestedByUserId ?? null,
      args.scheduledAt ?? new Date(),
      args.status ?? "queued"
    ]
  );
  return rows[0];
}

/**
 * Atomically claim up to `limit` queued rows that are due now. Uses
 * SELECT ... FOR UPDATE SKIP LOCKED to allow horizontal scaling.
 */
export async function claimBatch(limit: number): Promise<QueueRow[]> {
  return withTransaction(async (client) => {
    const { rows } = await client.query<QueueRow>(
      `UPDATE outbound_queue
          SET status = 'sent',           -- tentative; worker may reset on failure
              attempts = attempts + 1,
              updated_at = NOW()
        WHERE id IN (
          SELECT id FROM outbound_queue
           WHERE status = 'queued' AND scheduled_at <= NOW()
           ORDER BY scheduled_at ASC
           LIMIT $1
           FOR UPDATE SKIP LOCKED
        )
        RETURNING *`,
      [limit]
    );
    return rows;
  });
}

export async function markSent(
  id: number,
  waMessageId: string | null
): Promise<void> {
  await query(
    `UPDATE outbound_queue
        SET status = 'sent',
            wa_message_id = $2,
            sent_at = NOW(),
            updated_at = NOW(),
            last_error = NULL,
            last_error_code = NULL
      WHERE id = $1`,
    [id, waMessageId]
  );
}

export async function markFailedRetry(
  id: number,
  errorMsg: string,
  errorCode: string | null,
  nextAt: Date
): Promise<void> {
  await query(
    `UPDATE outbound_queue
        SET status = 'queued',
            scheduled_at = $2,
            last_error = $3,
            last_error_code = $4,
            updated_at = NOW()
      WHERE id = $1`,
    [id, nextAt, errorMsg, errorCode]
  );
}

export async function markAbandoned(
  id: number,
  errorMsg: string,
  errorCode: string | null
): Promise<void> {
  await query(
    `UPDATE outbound_queue
        SET status = 'abandoned',
            last_error = $2,
            last_error_code = $3,
            updated_at = NOW()
      WHERE id = $1`,
    [id, errorMsg, errorCode]
  );
}

export async function markWaiting24h(id: number, errorMsg: string): Promise<void> {
  await query(
    `UPDATE outbound_queue
        SET status = 'waiting_24h',
            last_error = $2,
            updated_at = NOW()
      WHERE id = $1`,
    [id, errorMsg]
  );
}

export async function listQueue(status?: QueueStatus, limit = 100): Promise<QueueRow[]> {
  const params: unknown[] = [limit];
  const where = status ? `WHERE status = $2` : "";
  if (status) params.push(status);
  const { rows } = await query<QueueRow>(
    `SELECT * FROM outbound_queue ${where} ORDER BY created_at DESC LIMIT $1`,
    params
  );
  return rows;
}
