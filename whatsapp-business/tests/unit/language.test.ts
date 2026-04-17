import { detectLanguage } from "../../src/services/language";

describe("language.detectLanguage", () => {
  it("detects Arabic-only text", () => {
    expect(detectLanguage("مرحبا كيف حالك")).toBe("ar");
  });
  it("detects English-only text", () => {
    expect(detectLanguage("hello how are you")).toBe("en");
  });
  it("prefers Arabic for mixed content (primary audience)", () => {
    expect(detectLanguage("Hello مرحبا")).toBe("ar");
  });
  it("returns null for empty or purely numeric input", () => {
    expect(detectLanguage("")).toBeNull();
    expect(detectLanguage("1234")).toBeNull();
  });
});
