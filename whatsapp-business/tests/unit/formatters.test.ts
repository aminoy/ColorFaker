import { toCSV, toJSON, toMarkdown } from "../../src/reporting/formatters";
import type { WeeklyMetrics } from "../../src/reporting/metrics";

const sample: WeeklyMetrics = {
  periodStart: "2025-04-07T00:00:00.000Z",
  periodEnd: "2025-04-14T00:00:00.000Z",
  totalConversations: 42,
  newContacts: 30,
  returningContacts: 12,
  conversationsByCategory: {
    hotel_booking: 22,
    retail_leasing: 10,
    vendor: 5,
    general_inquiry: 4,
    uncategorized: 1
  },
  leadsByCategory: {
    hotel_booking: 18,
    retail_leasing: 7,
    vendor: 4,
    general_inquiry: 4,
    uncategorized: 0
  },
  averageFirstResponseSeconds: 42.5,
  averageResolutionSeconds: 3600,
  handoffCount: 4,
  handoffRate: 4 / 42,
  topActiveDays: [
    { day: "2025-04-09", count: 10 },
    { day: "2025-04-10", count: 8 }
  ],
  topActiveHours: [
    { hour: 13, count: 9 },
    { hour: 20, count: 7 }
  ],
  arabicConversations: 32,
  englishConversations: 9,
  undetectedLanguageConversations: 1
};

describe("formatters", () => {
  it("CSV has a header and a value row", () => {
    const csv = toCSV(sample);
    const [header, values] = csv.trim().split("\n");
    expect(header.split(",")).toContain("total_conversations");
    expect(values).toContain("42");
  });

  it("JSON is valid and round-trips", () => {
    const parsed = JSON.parse(toJSON(sample));
    expect(parsed.totalConversations).toBe(42);
    expect(parsed.conversationsByCategory.hotel_booking).toBe(22);
  });

  it("Markdown includes the full template sections", () => {
    const md = toMarkdown(sample);
    expect(md).toContain("Reporting period");
    expect(md).toContain("Total conversations");
    expect(md).toContain("Booking inquiries");
    expect(md).toContain("Retail leasing inquiries");
    expect(md).toContain("Vendor inquiries");
    expect(md).toContain("General inquiries");
    expect(md).toContain("Average first response time");
    expect(md).toContain("Human handoff rate");
    expect(md).toContain("Key observations");
    expect(md).toContain("Recommended actions for next week");
  });
});
