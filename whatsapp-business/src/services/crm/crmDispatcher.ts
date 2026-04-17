import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { query } from "../../db/pool";
import { MockCrmAdapter } from "./mockAdapter";
import { WebhookCrmAdapter } from "./webhookAdapter";
import type { CrmAdapter, CrmLeadPayload } from "./types";

export const mockAdapter = new MockCrmAdapter();

/**
 * Resolve adapter by env. Tests can override via setAdapter().
 */
let activeAdapter: CrmAdapter = resolveDefault();

function resolveDefault(): CrmAdapter {
  if (env.CRM_ADAPTER === "webhook") return new WebhookCrmAdapter();
  if (env.CRM_ADAPTER === "disabled") {
    return {
      name: "disabled",
      async syncLead() {
        return { status: "success", externalId: null, response: { skipped: true } };
      }
    };
  }
  return mockAdapter;
}

export function setAdapter(adapter: CrmAdapter): void {
  activeAdapter = adapter;
}

export function getAdapter(): CrmAdapter {
  return activeAdapter;
}

export function backoffForAttempt(attempt: number): number {
  // attempt 1 -> 30s, 2 -> 60s, 3 -> 120s, capped at 10min.
  return Math.min(30_000 * 2 ** Math.max(0, attempt - 1), 10 * 60_000);
}

async function buildPayload(leadId: number): Promise<CrmLeadPayload | null> {
  const { rows } = await query<CrmLeadPayload & { created_at: Date }>(
    `SELECT
        l.id            AS lead_id,
        l.conversation_id,
        json_build_object(
          'wa_id',         c.wa_id,
          'display_name',  c.display_name,
          'language',      conv.language
        ) AS contact,
        l.category_code AS category,
        json_build_object(
          'full_name',       l.full_name,
          'contact_number',  l.contact_number,
          'email',           l.email,
          'stay_dates',      l.stay_dates,
          'number_of_guests',l.number_of_guests,
          'business_type',   l.business_type,
          'unit_type',       l.unit_type,
          'company_name',    l.company_name,
          'service_type',    l.service_type,
          'notes',           l.notes
        ) AS fields,
        COALESCE(conv.tags, ARRAY[]::text[]) AS tags,
        l.created_at
       FROM leads l
       JOIN contacts c      ON c.id = l.contact_id
       JOIN conversations conv ON conv.id = l.conversation_id
      WHERE l.id = $1`,
    [leadId]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    lead_id: r.lead_id,
    conversation_id: r.conversation_id,
    contact: r.contact,
    category: r.category,
    fields: r.fields,
    tags: r.tags,
    created_at: new Date(r.created_at).toISOString()
  };
}

export async function syncLeadAsync(
  leadId: number,
  conversationId: number
): Promise<{ status: string; externalId?: string | null } | null> {
  if (env.CRM_ADAPTER === "disabled") return null;
  const payload = await buildPayload(leadId);
  if (!payload) return null;

  const { rows: logRows } = await query<{ id: number; attempt: number }>(
    `INSERT INTO crm_sync_logs (lead_id, conversation_id, adapter, status, attempt, request)
     VALUES ($1,$2,$3,'queued',0,$4::jsonb)
     RETURNING id, attempt`,
    [leadId, conversationId, activeAdapter.name, JSON.stringify(payload)]
  );
  const logId = logRows[0].id;

  return attemptSync(logId, payload);
}

async function attemptSync(
  logId: number,
  payload: CrmLeadPayload
): Promise<{ status: string; externalId?: string | null }> {
  const { rows: curRows } = await query<{ attempt: number }>(
    `SELECT attempt FROM crm_sync_logs WHERE id = $1`,
    [logId]
  );
  const attempt = (curRows[0]?.attempt ?? 0) + 1;

  const result = await activeAdapter.syncLead(payload);

  if (result.status === "success") {
    await query(
      `UPDATE crm_sync_logs
         SET status = 'success',
             attempt = $2,
             external_id = $3,
             response = $4::jsonb,
             error = NULL,
             next_retry_at = NULL,
             updated_at = NOW()
       WHERE id = $1`,
      [logId, attempt, result.externalId ?? null, JSON.stringify(result.response ?? {})]
    );
    return { status: "success", externalId: result.externalId ?? null };
  }

  if (attempt >= env.CRM_RETRY_MAX) {
    await query(
      `UPDATE crm_sync_logs
         SET status = 'abandoned',
             attempt = $2,
             error = $3,
             response = $4::jsonb,
             next_retry_at = NULL,
             updated_at = NOW()
       WHERE id = $1`,
      [logId, attempt, result.error ?? "unknown", JSON.stringify(result.response ?? {})]
    );
    logger.warn({ logId, attempt }, "crm.sync.abandoned");
    return { status: "abandoned" };
  }

  const nextAt = new Date(Date.now() + backoffForAttempt(attempt));
  await query(
    `UPDATE crm_sync_logs
       SET status = 'failed',
           attempt = $2,
           error = $3,
           response = $4::jsonb,
           next_retry_at = $5,
           updated_at = NOW()
     WHERE id = $1`,
    [logId, attempt, result.error ?? "unknown", JSON.stringify(result.response ?? {}), nextAt]
  );
  logger.info({ logId, attempt, nextAt }, "crm.sync.retry_scheduled");
  return { status: "failed" };
}

/**
 * Retry all failed syncs whose `next_retry_at` has passed.
 * Invoked by the scheduler (or via the admin endpoint).
 */
export async function retryFailedSyncs(): Promise<number> {
  const { rows } = await query<{ id: number; request: CrmLeadPayload }>(
    `SELECT id, request
       FROM crm_sync_logs
      WHERE status = 'failed'
        AND next_retry_at IS NOT NULL
        AND next_retry_at <= NOW()
      ORDER BY next_retry_at ASC
      LIMIT 50`
  );
  for (const r of rows) {
    try {
      await attemptSync(r.id, r.request as unknown as CrmLeadPayload);
    } catch (err) {
      logger.error({ err, logId: r.id }, "crm.sync.retry_error");
    }
  }
  return rows.length;
}
