import { getServiceWindowStatus } from "../../src/services/serviceWindow";

const REF = new Date("2025-04-17T12:00:00Z");

describe("serviceWindow.getServiceWindowStatus", () => {
  it("closed if customer has never messaged", () => {
    const s = getServiceWindowStatus(null, REF, 24);
    expect(s.open).toBe(false);
    expect(s.reason).toBe("no_inbound");
  });

  it("open within 24h", () => {
    const s = getServiceWindowStatus(new Date("2025-04-17T06:00:00Z"), REF, 24);
    expect(s.open).toBe(true);
    expect(s.reason).toBe("open");
    expect(s.expiresAt).toEqual(new Date("2025-04-18T06:00:00Z"));
  });

  it("closed just after 24h", () => {
    const s = getServiceWindowStatus(new Date("2025-04-16T11:00:00Z"), REF, 24);
    expect(s.open).toBe(false);
    expect(s.reason).toBe("expired");
  });

  it("honours a custom window length", () => {
    const s = getServiceWindowStatus(new Date("2025-04-17T11:30:00Z"), REF, 1);
    expect(s.open).toBe(true);
    const s2 = getServiceWindowStatus(new Date("2025-04-17T10:30:00Z"), REF, 1);
    expect(s2.open).toBe(false);
  });
});
