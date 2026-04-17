import type { Request, Response } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { verifyMetaSignature } from "../services/signature";
import { getRawBody } from "../middleware/rawBody";
import {
  extractEvents,
  parseWebhook
} from "../services/webhookParser";
import {
  markWebhookProcessed,
  recordWebhookEvent,
  wasEventProcessed
} from "../models/webhookEvents";
import { handleInboundText } from "../services/conversationService";
import { updateMessageStatus } from "../models/messages";

export async function verifyWebhook(req: Request, res: Response): Promise<void> {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
    logger.info("webhook.verify.ok");
    res.status(200).send(String(challenge ?? ""));
    return;
  }
  logger.warn({ mode, tokenProvided: Boolean(token) }, "webhook.verify.denied");
  res.sendStatus(403);
}

export async function receiveWebhook(req: Request, res: Response): Promise<void> {
  const raw = getRawBody(req);
  const signature = req.header("x-hub-signature-256");
  const validSig = verifyMetaSignature(raw, signature, env.WHATSAPP_APP_SECRET);
  if (!validSig) {
    logger.warn(
      { hasRaw: Boolean(raw), hasHeader: Boolean(signature) },
      "webhook.signature_invalid"
    );
    res.sendStatus(401);
    return;
  }

  // Always acknowledge fast to Meta (they retry on non-2xx).
  res.sendStatus(200);

  // Process async after ack.
  processPayload(req.body).catch((err) =>
    logger.error({ err }, "webhook.processing_failed")
  );
}

async function processPayload(body: unknown): Promise<void> {
  let payload;
  try {
    payload = parseWebhook(body);
  } catch (err) {
    logger.error({ err, body }, "webhook.parse_failed");
    return;
  }

  const { inboundTextMessages, statuses } = extractEvents(payload);

  for (const msg of inboundTextMessages) {
    if (await wasEventProcessed(msg.wa_message_id)) {
      logger.info(
        { wa_message_id: msg.wa_message_id },
        "webhook.dedup.skip_duplicate"
      );
      continue;
    }
    const { id: eventRowId, inserted } = await recordWebhookEvent(
      msg.wa_message_id,
      msg.raw
    );
    if (!inserted) {
      logger.info({ wa_message_id: msg.wa_message_id }, "webhook.dedup.race");
      continue;
    }
    try {
      await handleInboundText(msg);
      if (eventRowId) await markWebhookProcessed(eventRowId);
    } catch (err) {
      const msgText = (err as Error).message;
      logger.error({ err, wa_message_id: msg.wa_message_id }, "webhook.handle_failed");
      if (eventRowId) await markWebhookProcessed(eventRowId, msgText);
    }
  }

  for (const status of statuses) {
    try {
      await updateMessageStatus(status.id, status.status, status.errors ? JSON.stringify(status.errors) : undefined);
    } catch (err) {
      logger.warn({ err, status }, "webhook.status_update_failed");
    }
  }
}
