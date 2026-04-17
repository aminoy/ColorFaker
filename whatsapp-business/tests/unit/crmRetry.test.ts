import { backoffForAttempt } from "../../src/services/crm/crmDispatcher";
import { MockCrmAdapter } from "../../src/services/crm/mockAdapter";

describe("crm backoff + retries", () => {
  it("exponential backoff is monotonic and capped", () => {
    const values = [1, 2, 3, 4, 5, 10, 20].map(backoffForAttempt);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
    expect(values[values.length - 1]).toBeLessThanOrEqual(10 * 60_000);
  });

  it("mock adapter captures successful payloads", async () => {
    const adapter = new MockCrmAdapter();
    const r = await adapter.syncLead({
      lead_id: 1,
      conversation_id: 2,
      contact: { wa_id: "9665", display_name: "A", language: "ar" },
      category: "hotel_booking",
      fields: { full_name: "A" },
      tags: [],
      created_at: new Date().toISOString()
    });
    expect(r.status).toBe("success");
    expect(adapter.captured).toHaveLength(1);
    expect(adapter.captured[0].lead_id).toBe(1);
  });

  it("mock adapter can simulate transient failures then succeed", async () => {
    const adapter = new MockCrmAdapter();
    adapter.failNextN = 2;
    const payload = {
      lead_id: 5,
      conversation_id: 9,
      contact: { wa_id: "9665", display_name: null, language: null },
      category: "general_inquiry",
      fields: {},
      tags: [],
      created_at: new Date().toISOString()
    };
    expect((await adapter.syncLead(payload)).status).toBe("failed");
    expect((await adapter.syncLead(payload)).status).toBe("failed");
    expect((await adapter.syncLead(payload)).status).toBe("success");
    expect(adapter.captured).toHaveLength(1);
  });
});
