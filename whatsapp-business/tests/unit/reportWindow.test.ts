import { previousWeekRange } from "../../src/reporting/writer";

describe("previousWeekRange", () => {
  it("returns an exclusive end of exactly 7 days for a Wednesday", () => {
    const wed = new Date(Date.UTC(2025, 3, 16)); // Wed 16 Apr 2025
    const { start, end } = previousWeekRange(wed);
    // previous full Mon-to-Mon window
    expect(start.toISOString().slice(0, 10)).toBe("2025-04-07");
    expect(end.toISOString().slice(0, 10)).toBe("2025-04-14");
    expect((end.getTime() - start.getTime()) / (1000 * 86400)).toBe(7);
  });

  it("works when 'now' is itself a Monday", () => {
    const mon = new Date(Date.UTC(2025, 3, 14));
    const { start, end } = previousWeekRange(mon);
    expect(start.toISOString().slice(0, 10)).toBe("2025-04-07");
    expect(end.toISOString().slice(0, 10)).toBe("2025-04-14");
  });
});
