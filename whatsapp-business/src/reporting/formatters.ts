import type { WeeklyMetrics } from "./metrics";

function fmtSeconds(s: number | null): string {
  if (s == null || Number.isNaN(s)) return "n/a";
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = s / 60;
  if (m < 60) return `${m.toFixed(1)}m`;
  const h = m / 60;
  return `${h.toFixed(2)}h`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

/**
 * CSV is a single row per metric so it is easy to concatenate weekly snapshots.
 */
export function toCSV(m: WeeklyMetrics): string {
  const rows: Array<[string, string]> = [
    ["period_start", m.periodStart],
    ["period_end", m.periodEnd],
    ["total_conversations", String(m.totalConversations)],
    ["new_contacts", String(m.newContacts)],
    ["returning_contacts", String(m.returningContacts)],
    ["hotel_booking_conversations", String(m.conversationsByCategory.hotel_booking)],
    ["retail_leasing_conversations", String(m.conversationsByCategory.retail_leasing)],
    ["vendor_conversations", String(m.conversationsByCategory.vendor)],
    ["general_inquiry_conversations", String(m.conversationsByCategory.general_inquiry)],
    ["uncategorized_conversations", String(m.conversationsByCategory.uncategorized)],
    ["hotel_booking_leads", String(m.leadsByCategory.hotel_booking)],
    ["retail_leasing_leads", String(m.leadsByCategory.retail_leasing)],
    ["vendor_leads", String(m.leadsByCategory.vendor)],
    ["general_inquiry_leads", String(m.leadsByCategory.general_inquiry)],
    [
      "avg_first_response_seconds",
      m.averageFirstResponseSeconds == null ? "" : m.averageFirstResponseSeconds.toFixed(2)
    ],
    [
      "avg_resolution_seconds",
      m.averageResolutionSeconds == null ? "" : m.averageResolutionSeconds.toFixed(2)
    ],
    ["handoff_count", String(m.handoffCount)],
    ["handoff_rate", m.handoffRate.toFixed(4)],
    ["arabic_conversations", String(m.arabicConversations)],
    ["english_conversations", String(m.englishConversations)],
    ["undetected_language_conversations", String(m.undetectedLanguageConversations)],
    [
      "top_active_days",
      m.topActiveDays.map((d) => `${d.day}:${d.count}`).join("|")
    ],
    [
      "top_active_hours",
      m.topActiveHours.map((h) => `${h.hour}:${h.count}`).join("|")
    ]
  ];
  const header = rows.map((r) => r[0]).join(",");
  const values = rows.map((r) => csvEscape(r[1])).join(",");
  return `${header}\n${values}\n`;
}

function csvEscape(v: string): string {
  if (v.includes(",") || v.includes("\"") || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function toJSON(m: WeeklyMetrics): string {
  return JSON.stringify(m, null, 2);
}

/**
 * Markdown summary using the template requested:
 *  - Reporting period
 *  - Total conversations
 *  - Booking inquiries
 *  - Retail leasing inquiries
 *  - Vendor inquiries
 *  - General inquiries
 *  - Average first response time
 *  - Human handoff rate
 *  - Key observations
 *  - Recommended actions for next week
 */
export function toMarkdown(m: WeeklyMetrics): string {
  const observations = buildObservations(m);
  const recommendations = buildRecommendations(m);

  return [
    `# Weekly WhatsApp Report — Jabal Omar`,
    ``,
    `**Reporting period:** ${m.periodStart.slice(0, 10)} → ${m.periodEnd.slice(0, 10)}`,
    ``,
    `## Conversation volume`,
    `- **Total conversations:** ${m.totalConversations}`,
    `- **New contacts:** ${m.newContacts}`,
    `- **Returning contacts:** ${m.returningContacts}`,
    ``,
    `## Inquiries by category`,
    `- **Booking inquiries:** ${m.conversationsByCategory.hotel_booking}`,
    `- **Retail leasing inquiries:** ${m.conversationsByCategory.retail_leasing}`,
    `- **Vendor inquiries:** ${m.conversationsByCategory.vendor}`,
    `- **General inquiries:** ${m.conversationsByCategory.general_inquiry}`,
    `- **Uncategorized:** ${m.conversationsByCategory.uncategorized}`,
    ``,
    `## Leads captured`,
    `- Hotel booking: **${m.leadsByCategory.hotel_booking}**`,
    `- Retail leasing: **${m.leadsByCategory.retail_leasing}**`,
    `- Vendor: **${m.leadsByCategory.vendor}**`,
    `- General: **${m.leadsByCategory.general_inquiry}**`,
    ``,
    `## Response performance`,
    `- **Average first response time:** ${fmtSeconds(m.averageFirstResponseSeconds)}`,
    `- **Average resolution time:** ${fmtSeconds(m.averageResolutionSeconds)}`,
    `- **Human handoff rate:** ${pct(m.handoffRate)} (${m.handoffCount} conversations)`,
    ``,
    `## Activity patterns`,
    `- **Top active days:** ${
      m.topActiveDays.length
        ? m.topActiveDays.slice(0, 3).map((d) => `${d.day} (${d.count})`).join(", ")
        : "n/a"
    }`,
    `- **Top active hours (UTC):** ${
      m.topActiveHours.length
        ? m.topActiveHours.slice(0, 3).map((h) => `${h.hour}:00 (${h.count})`).join(", ")
        : "n/a"
    }`,
    ``,
    `## Language split`,
    `- Arabic: ${m.arabicConversations}`,
    `- English: ${m.englishConversations}`,
    `- Undetected: ${m.undetectedLanguageConversations}`,
    ``,
    `## Key observations`,
    ...observations.map((o) => `- ${o}`),
    ``,
    `## Recommended actions for next week`,
    ...recommendations.map((r) => `- ${r}`),
    ``
  ].join("\n");
}

function buildObservations(m: WeeklyMetrics): string[] {
  const out: string[] = [];
  const total = m.totalConversations;
  if (total === 0) {
    out.push("No conversations were recorded this week.");
    return out;
  }

  const cats = m.conversationsByCategory;
  const sorted = (Object.entries(cats) as Array<[string, number]>)
    .filter(([k]) => k !== "uncategorized")
    .sort((a, b) => b[1] - a[1]);
  if (sorted.length && sorted[0][1] > 0) {
    out.push(`Most common inquiry type: **${sorted[0][0]}** (${sorted[0][1]} / ${total}).`);
  }
  if (cats.uncategorized / Math.max(total, 1) > 0.15) {
    out.push(
      `${cats.uncategorized} conversations (${pct(cats.uncategorized / total)}) were uncategorized — consider expanding keyword rules.`
    );
  }
  if (m.handoffRate > 0.2) {
    out.push(
      `Human handoff rate is high at ${pct(m.handoffRate)}; review flows for friction or missing intents.`
    );
  }
  if (m.arabicConversations + m.englishConversations > 0) {
    out.push(
      `Language split: ${m.arabicConversations} Arabic vs ${m.englishConversations} English (primary audience confirmed).`
    );
  }
  if (m.averageFirstResponseSeconds != null && m.averageFirstResponseSeconds > 60) {
    out.push(
      `Average first response time is ${fmtSeconds(m.averageFirstResponseSeconds)} — above target (<60s).`
    );
  }
  if (out.length === 0) out.push("Metrics within expected ranges this week.");
  return out;
}

function buildRecommendations(m: WeeklyMetrics): string[] {
  const out: string[] = [];
  if (m.totalConversations === 0) {
    out.push("Validate webhook subscription with Meta and run end-to-end smoke test.");
    return out;
  }
  if (m.handoffRate > 0.2) {
    out.push("Add more self-service answers for top handoff reasons to reduce load.");
  }
  if (m.conversationsByCategory.uncategorized > 0) {
    out.push("Review uncategorized transcripts and extend keyword dictionaries / add Arabic synonyms.");
  }
  if (m.leadsByCategory.hotel_booking < m.conversationsByCategory.hotel_booking) {
    out.push("Tighten hotel-booking lead capture prompt: ask explicitly for dates + guest count in first turn.");
  }
  if (m.leadsByCategory.retail_leasing < m.conversationsByCategory.retail_leasing) {
    out.push("Prompt retail leasing leads to share business type and preferred unit type earlier in the flow.");
  }
  if (m.topActiveHours.length > 0) {
    out.push(
      `Staff agent coverage around peak hours (${m.topActiveHours
        .slice(0, 2)
        .map((h) => `${h.hour}:00`)
        .join(", ")} UTC).`
    );
  }
  if (out.length === 0) out.push("Maintain current playbook — metrics stable.");
  return out;
}
