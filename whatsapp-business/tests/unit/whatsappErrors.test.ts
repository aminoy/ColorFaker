import { classifyMetaError } from "../../src/services/whatsappErrors";

describe("classifyMetaError", () => {
  it("classifies network errors as retryable", () => {
    expect(classifyMetaError(undefined, undefined, true)).toBe("retryable");
  });
  it("detects expired 24h window", () => {
    expect(
      classifyMetaError(400, { error: { code: 131047, message: "window closed" } }, false)
    ).toBe("expired_window");
  });
  it("detects rate limiting", () => {
    expect(classifyMetaError(429, undefined, false)).toBe("rate_limited");
    expect(classifyMetaError(400, { error: { code: 80007 } }, false)).toBe("rate_limited");
  });
  it("flags 5xx as retryable", () => {
    expect(classifyMetaError(502, {}, false)).toBe("retryable");
  });
  it("flags recipient issues as blocks", () => {
    expect(classifyMetaError(400, { error: { code: 131031 } }, false)).toBe("recipient_block");
  });
  it("defaults to permanent", () => {
    expect(classifyMetaError(400, { error: { code: 99999 } }, false)).toBe("permanent");
  });
});
