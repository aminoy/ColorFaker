/**
 * Classifies errors returned by the WhatsApp Cloud API so the queue worker can
 * decide whether to retry, template-fallback, or abandon.
 *
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */

export type ErrorClass =
  | "retryable"
  | "rate_limited"
  | "expired_window"   // 24h window has closed — need a template.
  | "recipient_block"  // invalid phone, account blocked, etc.
  | "permanent";

export interface MetaErrorLike {
  code?: number;
  subcode?: number;
  message?: string;
  error_data?: unknown;
}

const EXPIRED_WINDOW_CODES = new Set<number>([131047]); // "Message failed to send because more than 24 hours..."
const RETRYABLE_CODES      = new Set<number>([1, 2, 4, 131000, 130429, 131026]);
const RATE_LIMITED_CODES   = new Set<number>([80007, 131048, 4]);
const RECIPIENT_BLOCK_CODES = new Set<number>([131031, 131051, 131053]);

export function classifyMetaError(
  httpStatus: number | undefined,
  body: { error?: MetaErrorLike } | undefined,
  networkError: boolean
): ErrorClass {
  if (networkError) return "retryable";
  const code = body?.error?.code;
  if (code !== undefined) {
    if (EXPIRED_WINDOW_CODES.has(code)) return "expired_window";
    if (RATE_LIMITED_CODES.has(code)) return "rate_limited";
    if (RETRYABLE_CODES.has(code)) return "retryable";
    if (RECIPIENT_BLOCK_CODES.has(code)) return "recipient_block";
  }
  if (httpStatus && httpStatus >= 500) return "retryable";
  if (httpStatus === 429) return "rate_limited";
  return "permanent";
}
