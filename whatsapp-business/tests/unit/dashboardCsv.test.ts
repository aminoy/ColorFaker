import { toCsvRows } from "../../src/reporting/dashboard";

describe("dashboard.toCsvRows", () => {
  it("emits header + rows and escapes quotes/commas", () => {
    const out = toCsvRows(["a", "b", "c"], [
      { a: 1, b: "x,y", c: 'he said "hi"' },
      { a: 2, b: "plain", c: null }
    ]);
    expect(out).toContain("a,b,c\n");
    expect(out).toContain('1,"x,y","he said ""hi"""');
    expect(out).toContain("2,plain,");
  });

  it("wraps values containing newlines in quotes", () => {
    const out = toCsvRows(["v"], [{ v: "line1\nline2" }]);
    expect(out).toContain('"line1\nline2"');
  });

  it("handles empty data", () => {
    expect(toCsvRows(["x"], [])).toBe("x\n");
  });
});
