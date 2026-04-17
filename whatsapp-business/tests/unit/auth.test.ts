import {
  hashPassword,
  issueToken,
  verifyPassword,
  verifyToken
} from "../../src/services/auth";

describe("auth password hashing", () => {
  it("round-trips a password", () => {
    const hash = hashPassword("correct_horse_battery_staple");
    expect(verifyPassword("correct_horse_battery_staple", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("JWT issue + verify", () => {
  it("issues and verifies a token", () => {
    const token = issueToken({ id: 42, email: "a@b.c", role: "admin" });
    expect(token.split(".").length).toBe(3);
    const payload = verifyToken(token);
    expect(payload).toMatchObject({ sub: 42, email: "a@b.c", role: "admin" });
  });
  it("rejects a tampered token", () => {
    const token = issueToken({ id: 1, email: "a@b.c", role: "agent" });
    const [h, p] = token.split(".");
    const bad = `${h}.${p}.notsigned`;
    expect(verifyToken(bad)).toBeNull();
  });
});
