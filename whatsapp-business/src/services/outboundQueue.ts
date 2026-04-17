import { env } from "../config/env";
import { logger } from "../config/logger";
import { insertOutboundMessage } from "../models/messages";
import {
  claimBatch,
  enqueue,
  markAbandoned,
  markFailedRetry,
  markSent,
  markWaiting24h,
  type QueueKind,
  type QueueRow
} from "../models/outboundQueue";
import { whatsappClient } from "./whatsappClient";
import { classifyMetaError } from "./whatsappErrors";
import { getServiceWindowStatus } from "./serviceWindow";
import { query } from "../db/pool";

export interface EnqueueTextArgs {
  conversationId: number;
  contactWaId: string;
  body: string;
  requestedByUserId?: number | null;
  /**
   * If we're outside the 24h window, fall back to a template if configured.
   * Defaults to true.
   */
  allowTemplateFallback?: boolean;
}

export async function enqueueText(args: EnqueueTextArgs): Promise<QueueRow> {
  const last = await query<{ last_customer_message_at: Date | null }>(
    `SELECT last_customer_message_at FROM conversations WHERE id = $1`,
    [args.conversationId]
  );
  const status = getServiceWindowStatus(last.rows[0]?.last_customer_message_at);

  if (!status.open && (args.allowTemplateFallback ?? true)) {
    if (env.WHATSAPP_DEFAULT_TEMPLATE_NAME) {
      logger.info(
        { conversationId: args.conversationId, reason: status.reason },
        "outboundQueue.service_window_closed.falling_back_to_template"
      );
      return enqueue({
        conversationId: args.conversationId,
        contactWaId: args.contactWaId,
        kind: "template",
        templateName: env.WHATSAPP_DEFAULT_TEMPLATE_NAME,
        templateLanguage: env.WHATSAPP_DEFAULT_TEMPLATE_LANG,
        templateVariables: [args.body.slice(0, 60)],
        payload: { original_body: args.body, reason: "service_window_closed" },
        requestedByUserId: args.requestedByUserId ?? null,
        status: "queued"
      });
    }
    // No template configured; mark as waiting until customer re-engages.
    logger.warn(
      { conversationId: args.conversationId },
      "outboundQueue.service_window_closed.no_template"
    );
    return enqueue({
      conversationId: args.conversationId,
      contactWaId: args.contactWaId,
      kind: "text",
      body: args.body,
      requestedByUserId: args.requestedByUserId ?? null,
      status: "waiting_24h"
    });
  }

  return enqueue({
    conversationId: args.conversationId,
    contactWaId: args.contactWaId,
    kind: "text",
    body: args.body,
    requestedByUserId: args.requestedByUserId ?? null
  });
}

export function backoffDelayMs(attempts: number): number {
  return Math.min(30_000 * 2 ** Math.max(0, attempts - 1), 10 * 60_000);
}

function buildPayload(row: QueueRow): { payload: unknown; kind: QueueKind } {
  if (row.kind === "template") {
    return {
      kind: "template",
      payload: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: row.contact_wa_id,
        type: "template",
        template: {
          name: row.template_name,
          language: { code: row.template_language ?? env.WHATSAPP_DEFAULT_TEMPLATE_LANG },
          components:
            Array.isArray(row.template_variables) && (row.template_variables as unknown[]).length
              ? [
                  {
                    type: "body",
                    parameters: (row.template_variables as unknown[]).map((v) => ({
                      type: "text",
                      text: String(v)
                    }))
                  }
                ]
              : []
        }
      }
    };
  }
  return {
    kind: "text",
    payload: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: row.contact_wa_id,
      type: "text",
      text: { body: row.body ?? "" }
    }
  };
}

export async function processBatch(): Promise<number> {
  const batch = await claimBatch(env.OUTBOUND_QUEUE_BATCH_SIZE);
  for (const row of batch) {
    try {
      const { payload } = buildPayload(row);
      const resp = await whatsappClient.sendRaw(payload);
      if (resp.ok) {
        const waId =
          (resp.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id ?? null;
        await markSent(row.id, waId);
        await insertOutboundMessage({
          conversationId: row.conversation_id,
          waMessageId: waId,
          messageType: row.kind,
          body: row.body,
          payload: { queue_row_id: row.id, request: payload }
        });
        logger.info({ id: row.id, waId }, "outboundQueue.sent");
        continue;
      }

      const errorBody = resp.data as {
        error?: { code?: number; message?: string; error_data?: unknown };
      };
      const cls = classifyMetaError(resp.status, errorBody, false);
      const code = String(errorBody.error?.code ?? resp.status);
      const msg = errorBody.error?.message ?? `HTTP ${resp.status}`;

      if (cls === "expired_window") {
        // Convert to template if we have one, else park until reply.
        if (env.WHATSAPP_DEFAULT_TEMPLATE_NAME && row.kind !== "template") {
          await enqueue({
            conversationId: row.conversation_id,
            contactWaId: row.contact_wa_id,
            kind: "template",
            templateName: env.WHATSAPP_DEFAULT_TEMPLATE_NAME,
            templateLanguage: env.WHATSAPP_DEFAULT_TEMPLATE_LANG,
            templateVariables: [row.body?.slice(0, 60) ?? ""],
            payload: { original_queue_id: row.id },
            requestedByUserId: row.requested_by_user,
            status: "queued"
          });
          await markAbandoned(row.id, "window_expired_template_spawned", code);
        } else {
          await markWaiting24h(row.id, msg);
        }
        continue;
      }

      if (cls === "retryable" || cls === "rate_limited") {
        if (row.attempts >= env.OUTBOUND_MAX_ATTEMPTS) {
          await markAbandoned(row.id, msg, code);
        } else {
          const nextAt = new Date(Date.now() + backoffDelayMs(row.attempts));
          await markFailedRetry(row.id, msg, code, nextAt);
        }
        continue;
      }

      // permanent or recipient_block
      await markAbandoned(row.id, msg, code);
    } catch (err) {
      const code = "exception";
      const msg = (err as Error).message;
      if (row.attempts >= env.OUTBOUND_MAX_ATTEMPTS) {
        await markAbandoned(row.id, msg, code);
      } else {
        await markFailedRetry(row.id, msg, code, new Date(Date.now() + backoffDelayMs(row.attempts)));
      }
    }
  }
  return batch.length;
}

let timer: NodeJS.Timeout | null = null;

export function startQueueWorker(): void {
  if (timer) return;
  const loop = async () => {
    try {
      await processBatch();
    } catch (err) {
      logger.error({ err }, "outboundQueue.worker_error");
    } finally {
      timer = setTimeout(loop, env.OUTBOUND_QUEUE_POLL_MS);
    }
  };
  timer = setTimeout(loop, env.OUTBOUND_QUEUE_POLL_MS);
  logger.info({ pollMs: env.OUTBOUND_QUEUE_POLL_MS }, "outboundQueue.worker_started");
}

export function stopQueueWorker(): void {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
