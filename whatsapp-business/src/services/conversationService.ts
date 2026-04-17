import { logger } from "../config/logger";
import {
  createConversation,
  getOpenConversation,
  markFirstResponse,
  updateConversationState
} from "../models/conversations";
import { upsertContact } from "../models/contacts";
import {
  insertInboundMessage,
  insertOutboundMessage
} from "../models/messages";
import { recordHandoff } from "../models/handoff";
import { upsertLead } from "../models/leads";
import { detectLanguage } from "./language";
import { classify } from "./intent";
import { extractFields } from "./leadExtraction";
import { transition, type BotAction } from "../state/stateMachine";
import * as tpl from "./templates";
import { whatsappClient } from "./whatsappClient";
import type { InboundTextMessage, Language } from "../types/domain";

export interface ConversationDeps {
  sendText: (to: string, body: string) => Promise<{ messages: { id: string }[] }>;
}

/**
 * Handle a single inbound text message end-to-end.
 * Dedup is expected to happen upstream (webhook controller), but this function
 * is still idempotent because messages.wa_message_id is unique.
 */
export async function handleInboundText(
  msg: InboundTextMessage,
  deps: ConversationDeps = {
    sendText: async (to, body) => whatsappClient.sendText({ to, body })
  }
): Promise<{ conversationId: number; actions: BotAction[] }> {
  const language: Language | null = detectLanguage(msg.text);

  const { contact, isNew } = await upsertContact(msg.from, msg.profile_name, language);

  let conversation = await getOpenConversation(contact.id);
  if (!conversation) {
    conversation = await createConversation(contact.id, language);
  }

  // Persist inbound message (idempotent on wa_message_id)
  const inserted = await insertInboundMessage({
    conversationId: conversation.id,
    waMessageId: msg.wa_message_id,
    messageType: "text",
    body: msg.text,
    payload: msg.raw
  });

  if (!inserted) {
    logger.info(
      { wa_message_id: msg.wa_message_id },
      "conversation.duplicate_inbound_message"
    );
    return { conversationId: conversation.id, actions: [] };
  }

  const intent = classify(msg.text);

  const decision = transition({
    currentState: conversation.state,
    currentCategory: conversation.category_code,
    isNewContact: isNew,
    classifiedCategory: intent.category,
    needsHuman: intent.needsHuman,
    language
  });

  // Update conversation tags merging current tags + new ones
  const mergedTags = Array.from(new Set([...(conversation.tags ?? []), ...decision.tags]));

  const updated = await updateConversationState(conversation.id, decision.nextState, {
    category_code: decision.category ?? undefined,
    needs_human: decision.needsHuman,
    tags: mergedTags,
    language: language ?? undefined
  });

  if (decision.needsHuman) {
    await recordHandoff(
      conversation.id,
      intent.handoffReason ?? "bot_detected",
      "bot",
      `Auto-escalation from message "${msg.text.slice(0, 120)}"`
    );
  }

  // Lead capture for category-bearing conversations.
  if (decision.category) {
    const fields = extractFields(msg.text, decision.category);
    if (
      fields.fullName ||
      fields.contactNumber ||
      fields.email ||
      fields.stayDates ||
      fields.numberOfGuests ||
      fields.businessType ||
      fields.unitType ||
      fields.companyName ||
      fields.serviceType ||
      fields.notes ||
      decision.category === "general_inquiry"
    ) {
      await upsertLead({
        conversationId: conversation.id,
        contactId: contact.id,
        categoryCode: decision.category,
        fullName: fields.fullName ?? contact.display_name ?? null,
        contactNumber: fields.contactNumber ?? msg.from,
        email: fields.email ?? null,
        stayDates: fields.stayDates ?? null,
        numberOfGuests: fields.numberOfGuests ?? null,
        businessType: fields.businessType ?? null,
        unitType: fields.unitType ?? null,
        companyName: fields.companyName ?? null,
        serviceType: fields.serviceType ?? null,
        notes: fields.notes ?? null,
        rawFields: { extracted: fields, last_message: msg.text }
      });
    }
  }

  // Execute bot actions (send replies).
  for (const action of decision.actions) {
    const body = renderAction(action);
    try {
      const resp = await deps.sendText(msg.from, body);
      await insertOutboundMessage({
        conversationId: conversation.id,
        waMessageId: resp.messages?.[0]?.id ?? null,
        messageType: "text",
        body,
        payload: { action }
      });
      await markFirstResponse(conversation.id);
    } catch (err) {
      logger.error({ err, action }, "conversation.send_failed");
      await insertOutboundMessage({
        conversationId: conversation.id,
        waMessageId: null,
        messageType: "text",
        body,
        payload: { action },
        status: "failed",
        error: (err as Error).message
      });
    }
  }

  logger.info(
    {
      conversationId: conversation.id,
      state: updated.state,
      category: updated.category_code,
      needs_human: updated.needs_human
    },
    "conversation.handled"
  );

  return { conversationId: conversation.id, actions: decision.actions };
}

export function renderAction(action: BotAction): string {
  switch (action.kind) {
    case "send_welcome":
      return tpl.welcome(action.language);
    case "send_invalid_option":
      return tpl.invalidOption(action.language);
    case "send_acknowledgement":
      return tpl.acknowledgement(action.category, action.language);
    case "send_handoff_notice":
      return tpl.humanHandoff(action.language);
    case "collect_more":
      // Ack already prompts for the fields; keep quiet to avoid double-message.
      return tpl.thankYou(action.language);
  }
}
