import { backoffDelayMs } from "../../src/services/outboundQueue";

describe("outboundQueue.backoffDelayMs", () => {
  it("grows exponentially with attempts", () => {
    expect(backoffDelayMs(1)).toBe(30_000);
    expect(backoffDelayMs(2)).toBe(60_000);
    expect(backoffDelayMs(3)).toBe(120_000);
    expect(backoffDelayMs(4)).toBe(240_000);
  });

  it("caps at 10 minutes", () => {
    expect(backoffDelayMs(20)).toBe(10 * 60_000);
  });

  it("attempt 0 returns the first slot", () => {
    expect(backoffDelayMs(0)).toBe(30_000);
  });
});
