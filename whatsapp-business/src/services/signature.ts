import crypto from "crypto";

/**
 * Validates the X-Hub-Signature-256 header sent by Meta.
 * @returns true if header is valid or if secret is empty (dev only)
 */
export function verifyMetaSignature(
  rawBody: Buffer | undefined,
  headerValue: string | string[] | undefined,
  appSecret: string
): boolean {
  if (!rawBody) return false;
  if (!headerValue || typeof headerValue !== "string") return false;

  const [scheme, signature] = headerValue.split("=");
  if (scheme !== "sha256" || !signature) return false;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
