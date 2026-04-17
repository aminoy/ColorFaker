import { z } from "zod";
import type { InboundTextMessage } from "../types/domain";

/**
 * Zod schema for WhatsApp Cloud API webhook payload.
 * We only parse the subset we use; extra fields are allowed.
 */
const profileSchema = z.object({ name: z.string().optional() }).partial().optional();

const messageSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.string(),
  text: z.object({ body: z.string() }).optional(),
  interactive: z
    .object({
      type: z.string(),
      button_reply: z.object({ id: z.string(), title: z.string() }).optional(),
      list_reply: z.object({ id: z.string(), title: z.string() }).optional()
    })
    .optional(),
  context: z.object({ id: z.string().optional() }).partial().optional()
});

const statusSchema = z.object({
  id: z.string(),
  status: z.string(),
  timestamp: z.string(),
  recipient_id: z.string().optional(),
  errors: z.array(z.record(z.unknown())).optional()
});

const valueSchema = z.object({
  messaging_product: z.string().optional(),
  metadata: z
    .object({
      display_phone_number: z.string().optional(),
      phone_number_id: z.string().optional()
    })
    .partial()
    .optional(),
  contacts: z
    .array(z.object({ profile: profileSchema, wa_id: z.string() }))
    .optional(),
  messages: z.array(messageSchema).optional(),
  statuses: z.array(statusSchema).optional()
});

const changeSchema = z.object({
  value: valueSchema,
  field: z.string()
});

const entrySchema = z.object({
  id: z.string(),
  changes: z.array(changeSchema)
});

export const webhookSchema = z.object({
  object: z.string(),
  entry: z.array(entrySchema)
});

export type WebhookPayload = z.infer<typeof webhookSchema>;
export type WebhookMessage = z.infer<typeof messageSchema>;
export type WebhookStatus = z.infer<typeof statusSchema>;

export function parseWebhook(body: unknown): WebhookPayload {
  return webhookSchema.parse(body);
}

export interface ExtractedEvents {
  inboundTextMessages: InboundTextMessage[];
  statuses: WebhookStatus[];
}

export function extractEvents(payload: WebhookPayload): ExtractedEvents {
  const inboundTextMessages: InboundTextMessage[] = [];
  const statuses: WebhookStatus[] = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;
      const contactsByWaId = new Map<string, string | undefined>();
      (value.contacts ?? []).forEach((c) =>
        contactsByWaId.set(c.wa_id, c.profile?.name)
      );

      for (const msg of value.messages ?? []) {
        let text: string | null = null;
        if (msg.type === "text" && msg.text?.body) text = msg.text.body;
        else if (msg.type === "interactive") {
          text =
            msg.interactive?.list_reply?.title ??
            msg.interactive?.list_reply?.id ??
            msg.interactive?.button_reply?.title ??
            msg.interactive?.button_reply?.id ??
            null;
        }
        if (text === null) continue;
        inboundTextMessages.push({
          wa_message_id: msg.id,
          from: msg.from,
          profile_name: contactsByWaId.get(msg.from) ?? undefined,
          text,
          timestamp: new Date(Number(msg.timestamp) * 1000),
          raw: msg as unknown as Record<string, unknown>
        });
      }

      for (const status of value.statuses ?? []) {
        statuses.push(status);
      }
    }
  }

  return { inboundTextMessages, statuses };
}
