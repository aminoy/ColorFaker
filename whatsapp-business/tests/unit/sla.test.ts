import { computeDeadlines, pickRule, type SlaRule } from "../../src/services/sla";

const rules: SlaRule[] = [
  { id: 1, category_code: "hotel_booking", priority: null,     first_response_minutes: 5,  resolution_minutes: 240,  description: null, is_active: true },
  { id: 2, category_code: "hotel_booking", priority: "urgent", first_response_minutes: 2,  resolution_minutes: 60,   description: null, is_active: true },
  { id: 3, category_code: "retail_leasing", priority: null,    first_response_minutes: 30, resolution_minutes: 1440, description: null, is_active: true },
  { id: 4, category_code: null,            priority: null,     first_response_minutes: 60, resolution_minutes: 2880, description: null, is_active: true }
];

describe("sla.pickRule", () => {
  it("prefers exact category + priority match", () => {
    expect(pickRule(rules, "hotel_booking", "urgent")?.id).toBe(2);
  });
  it("falls back to category + null priority", () => {
    expect(pickRule(rules, "hotel_booking", "normal")?.id).toBe(1);
  });
  it("falls back to the global rule", () => {
    expect(pickRule(rules, "vendor", "low")?.id).toBe(4);
  });
  it("respects active=false", () => {
    const subset = rules.map((r) => ({ ...r, is_active: r.id !== 4 }));
    // With no global fallback, vendor/low should resolve to nothing.
    expect(pickRule(subset.filter((r) => r.is_active), "vendor", "low")).toBeNull();
  });
});

describe("sla.computeDeadlines", () => {
  it("adds the configured minutes", () => {
    const started = new Date("2025-04-17T10:00:00Z");
    const rule = pickRule(rules, "hotel_booking", "urgent")!;
    const d = computeDeadlines(rule, started);
    expect(d.first_response_due_at?.toISOString()).toBe("2025-04-17T10:02:00.000Z");
    expect(d.resolution_due_at?.toISOString()).toBe("2025-04-17T11:00:00.000Z");
  });
  it("returns nulls when no rule matches", () => {
    const d = computeDeadlines(null, new Date());
    expect(d).toEqual({ first_response_due_at: null, resolution_due_at: null, rule: null });
  });
});
