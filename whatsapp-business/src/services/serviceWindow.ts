import { env } from "../config/env";

/**
 * WhatsApp Cloud API restricts free-form messages to the 24h "customer service
 * window" that opens when the user sends us a message and closes 24h after
 * their last inbound message. Outside that window only approved message
 * templates can be used.
 */
export interface ServiceWindowStatus {
  open: boolean;
  expiresAt: Date | null;
  reason: "no_inbound" | "expired" | "open";
}

export function getServiceWindowStatus(
  lastCustomerMessageAt: Date | null | undefined,
  now: Date = new Date(),
  windowHours: number = env.WHATSAPP_SERVICE_WINDOW_HOURS
): ServiceWindowStatus {
  if (!lastCustomerMessageAt) {
    return { open: false, expiresAt: null, reason: "no_inbound" };
  }
  const expiresAt = new Date(
    new Date(lastCustomerMessageAt).getTime() + windowHours * 60 * 60 * 1000
  );
  if (now >= expiresAt) return { open: false, expiresAt, reason: "expired" };
  return { open: true, expiresAt, reason: "open" };
}
