import crypto from "crypto";
import { verifyMetaSignature } from "../../src/services/signature";

const secret = "app_secret_for_tests";
const body = Buffer.from(JSON.stringify({ object: "whatsapp_business_account" }));

function signature(buf: Buffer, key: string): string {
  return "sha256=" + crypto.createHmac("sha256", key).update(buf).digest("hex");
}

describe("verifyMetaSignature", () => {
  it("accepts a valid signature", () => {
    expect(verifyMetaSignature(body, signature(body, secret), secret)).toBe(true);
  });
  it("rejects a tampered body", () => {
    const sig = signature(body, secret);
    const tampered = Buffer.from(body.toString() + " ");
    expect(verifyMetaSignature(tampered, sig, secret)).toBe(false);
  });
  it("rejects a wrong secret", () => {
    expect(verifyMetaSignature(body, signature(body, secret), "different")).toBe(false);
  });
  it("rejects missing or malformed header", () => {
    expect(verifyMetaSignature(body, undefined, secret)).toBe(false);
    expect(verifyMetaSignature(body, "nope", secret)).toBe(false);
    expect(verifyMetaSignature(body, "sha256=", secret)).toBe(false);
  });
});
