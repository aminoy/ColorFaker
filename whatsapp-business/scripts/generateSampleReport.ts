import fs from "fs";
import path from "path";
import { toCSV, toJSON, toMarkdown } from "../src/reporting/formatters";
import type { WeeklyMetrics } from "../src/reporting/metrics";

const sample: WeeklyMetrics = {
  periodStart: "2025-04-07T00:00:00.000Z",
  periodEnd: "2025-04-14T00:00:00.000Z",
  totalConversations: 128,
  newContacts: 94,
  returningContacts: 34,
  conversationsByCategory: {
    hotel_booking: 63,
    retail_leasing: 28,
    vendor: 14,
    general_inquiry: 19,
    uncategorized: 4
  },
  leadsByCategory: {
    hotel_booking: 55,
    retail_leasing: 22,
    vendor: 14,
    general_inquiry: 19,
    uncategorized: 0
  },
  averageFirstResponseSeconds: 38.4,
  averageResolutionSeconds: 5400,
  handoffCount: 17,
  handoffRate: 17 / 128,
  topActiveDays: [
    { day: "2025-04-09", count: 28 },
    { day: "2025-04-11", count: 24 },
    { day: "2025-04-12", count: 21 }
  ],
  topActiveHours: [
    { hour: 13, count: 19 },
    { hour: 20, count: 17 },
    { hour: 9, count: 14 }
  ],
  arabicConversations: 101,
  englishConversations: 25,
  undetectedLanguageConversations: 2
};

const dir = path.resolve(__dirname, "../reports");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "sample-weekly.csv"), toCSV(sample));
fs.writeFileSync(path.join(dir, "sample-weekly.json"), toJSON(sample));
fs.writeFileSync(path.join(dir, "sample-weekly.md"), toMarkdown(sample));
// eslint-disable-next-line no-console
console.log("Wrote sample reports to", dir);
