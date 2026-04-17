import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { query } from "../db/pool";

export interface SlaBreach {
  conversation_id: number;
  kind: "first_response" | "resolution";
  category_code: string | null;
  priority: string;
  status: string;
  assignee_email: string | null;
  due_at: Date;
  wa_id: string;
  display_name: string | null;
}

/**
 * Detects breaches that have not yet been logged in sla_breach_events.
 * A breach is logged once per (conversation, kind) — dedup via UNIQUE index.
 */
export async function detectUnnotifiedBreaches(): Promise<SlaBreach[]> {
  const { rows } = await query<SlaBreach>(
    `SELECT c.id AS conversation_id,
            k.kind,
            c.category_code,
            c.priority,
            c.status,
            u.email AS assignee_email,
            CASE WHEN k.kind = 'first_response' THEN c.first_response_due_at
                 ELSE c.resolution_due_at END AS due_at,
            ct.wa_id,
            ct.display_name
       FROM conversations c
       JOIN contacts ct   ON ct.id = c.contact_id
       LEFT JOIN users u  ON u.id = c.assignee_id
       JOIN (SELECT 'first_response'::text AS kind UNION ALL SELECT 'resolution') k ON TRUE
      WHERE c.status NOT IN ('resolved','closed','archived')
        AND (
          (k.kind = 'first_response' AND c.first_response_due_at IS NOT NULL AND c.first_response_due_at < NOW() AND c.first_response_at IS NULL)
          OR
          (k.kind = 'resolution'     AND c.resolution_due_at     IS NOT NULL AND c.resolution_due_at     < NOW() AND c.resolved_at       IS NULL)
        )
        AND NOT EXISTS (
          SELECT 1 FROM sla_breach_events e
           WHERE e.conversation_id = c.id AND e.kind = k.kind
        )
      ORDER BY due_at ASC
      LIMIT 100`
  );
  return rows;
}

async function recordBreach(breach: SlaBreach, deliveryStatus: string): Promise<void> {
  await query(
    `INSERT INTO sla_breach_events (conversation_id, kind, notified_at, delivery_status)
     VALUES ($1, $2, NOW(), $3)
     ON CONFLICT (conversation_id, kind) DO NOTHING`,
    [breach.conversation_id, breach.kind, deliveryStatus]
  );
}

function formatSlack(breach: SlaBreach): Record<string, unknown> {
  const title =
    breach.kind === "first_response"
      ? ":warning: SLA breach — first response"
      : ":rotating_light: SLA breach — resolution";
  const lines = [
    `*Conversation:* #${breach.conversation_id} — ${breach.display_name ?? breach.wa_id}`,
    `*Category:* ${breach.category_code ?? "—"} *Priority:* ${breach.priority}`,
    `*Status:* ${breach.status}`,
    `*Due at:* ${new Date(breach.due_at).toISOString()}`,
    `*Assignee:* ${breach.assignee_email ?? "unassigned"}`
  ];
  return {
    text: `${title}\n${lines.join("\n")}`
  };
}

async function deliver(breach: SlaBreach): Promise<string> {
  if (!env.SLA_ALERTS_WEBHOOK_URL) return "no_webhook_configured";
  try {
    await axios.post(env.SLA_ALERTS_WEBHOOK_URL, formatSlack(breach), {
      timeout: 5_000
    });
    return "delivered";
  } catch (err) {
    logger.warn({ err: (err as Error).message, conv: breach.conversation_id }, "sla.notify.failed");
    return "failed";
  }
}

export async function runSlaNotifierOnce(): Promise<number> {
  if (!env.SLA_ALERTS_ENABLED) return 0;
  const breaches = await detectUnnotifiedBreaches();
  for (const b of breaches) {
    const status = await deliver(b);
    await recordBreach(b, status);
  }
  return breaches.length;
}
