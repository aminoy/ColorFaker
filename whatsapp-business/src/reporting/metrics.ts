import { query } from "../db/pool";
import type { CategoryCode } from "../types/domain";

export interface WeeklyMetrics {
  periodStart: string; // ISO date (UTC)
  periodEnd: string;   // ISO date (UTC, exclusive)
  totalConversations: number;
  newContacts: number;
  returningContacts: number;
  conversationsByCategory: Record<CategoryCode | "uncategorized", number>;
  averageFirstResponseSeconds: number | null;
  averageResolutionSeconds: number | null;
  handoffCount: number;
  handoffRate: number;
  leadsByCategory: Record<CategoryCode | "uncategorized", number>;
  topActiveDays: Array<{ day: string; count: number }>;
  topActiveHours: Array<{ hour: number; count: number }>;
  arabicConversations: number;
  englishConversations: number;
  undetectedLanguageConversations: number;
}

/**
 * Compute weekly metrics. All "period" filtering is done by started_at.
 */
export async function computeWeeklyMetrics(
  periodStart: Date,
  periodEnd: Date
): Promise<WeeklyMetrics> {
  const start = periodStart.toISOString();
  const end = periodEnd.toISOString();

  const total = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM conversations
     WHERE started_at >= $1 AND started_at < $2`,
    [start, end]
  );

  const newContacts = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM contacts
     WHERE first_seen_at >= $1 AND first_seen_at < $2`,
    [start, end]
  );

  const returningContacts = await query<{ count: string }>(
    `SELECT COUNT(DISTINCT contact_id)::text AS count FROM conversations c
     WHERE c.started_at >= $1 AND c.started_at < $2
       AND EXISTS (SELECT 1 FROM contacts ct
                    WHERE ct.id = c.contact_id AND ct.first_seen_at < $1)`,
    [start, end]
  );

  const byCategory = await query<{ category_code: string | null; count: string }>(
    `SELECT category_code, COUNT(*)::text AS count
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2
      GROUP BY category_code`,
    [start, end]
  );

  const firstResponse = await query<{ avg_seconds: string | null }>(
    `SELECT EXTRACT(EPOCH FROM AVG(first_response_at - started_at))::text AS avg_seconds
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2
        AND first_response_at IS NOT NULL`,
    [start, end]
  );

  const resolution = await query<{ avg_seconds: string | null }>(
    `SELECT EXTRACT(EPOCH FROM AVG(resolved_at - started_at))::text AS avg_seconds
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2
        AND resolved_at IS NOT NULL`,
    [start, end]
  );

  const handoff = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM conversations
      WHERE started_at >= $1 AND started_at < $2
        AND needs_human = TRUE`,
    [start, end]
  );

  const leadsByCategory = await query<{ category_code: string; count: string }>(
    `SELECT category_code, COUNT(*)::text AS count
       FROM leads
      WHERE created_at >= $1 AND created_at < $2
      GROUP BY category_code`,
    [start, end]
  );

  const topDays = await query<{ day: string; count: string }>(
    `SELECT to_char(date_trunc('day', started_at), 'YYYY-MM-DD') AS day,
            COUNT(*)::text AS count
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2
      GROUP BY day
      ORDER BY COUNT(*) DESC, day ASC`,
    [start, end]
  );

  const topHours = await query<{ hour: string; count: string }>(
    `SELECT EXTRACT(HOUR FROM started_at)::text AS hour,
            COUNT(*)::text AS count
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2
      GROUP BY hour
      ORDER BY COUNT(*) DESC, hour ASC
      LIMIT 5`,
    [start, end]
  );

  const language = await query<{ language: string | null; count: string }>(
    `SELECT language, COUNT(*)::text AS count
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2
      GROUP BY language`,
    [start, end]
  );

  const conversationsByCategory: WeeklyMetrics["conversationsByCategory"] = {
    hotel_booking: 0,
    retail_leasing: 0,
    vendor: 0,
    general_inquiry: 0,
    uncategorized: 0
  };
  for (const row of byCategory.rows) {
    const key = (row.category_code ?? "uncategorized") as keyof typeof conversationsByCategory;
    conversationsByCategory[key] = Number(row.count);
  }

  const leadsByCategoryOut: WeeklyMetrics["leadsByCategory"] = {
    hotel_booking: 0,
    retail_leasing: 0,
    vendor: 0,
    general_inquiry: 0,
    uncategorized: 0
  };
  for (const row of leadsByCategory.rows) {
    const key = row.category_code as keyof typeof leadsByCategoryOut;
    leadsByCategoryOut[key] = Number(row.count);
  }

  const totalConversations = Number(total.rows[0]?.count ?? 0);
  const handoffCount = Number(handoff.rows[0]?.count ?? 0);
  const handoffRate = totalConversations > 0 ? handoffCount / totalConversations : 0;

  let arabic = 0;
  let english = 0;
  let unknown = 0;
  for (const row of language.rows) {
    const n = Number(row.count);
    if (row.language === "ar") arabic = n;
    else if (row.language === "en") english = n;
    else unknown = n;
  }

  return {
    periodStart: start,
    periodEnd: end,
    totalConversations,
    newContacts: Number(newContacts.rows[0]?.count ?? 0),
    returningContacts: Number(returningContacts.rows[0]?.count ?? 0),
    conversationsByCategory,
    averageFirstResponseSeconds:
      firstResponse.rows[0]?.avg_seconds == null
        ? null
        : Number(firstResponse.rows[0].avg_seconds),
    averageResolutionSeconds:
      resolution.rows[0]?.avg_seconds == null
        ? null
        : Number(resolution.rows[0].avg_seconds),
    handoffCount,
    handoffRate,
    leadsByCategory: leadsByCategoryOut,
    topActiveDays: topDays.rows.map((r) => ({ day: r.day, count: Number(r.count) })),
    topActiveHours: topHours.rows.map((r) => ({ hour: Number(r.hour), count: Number(r.count) })),
    arabicConversations: arabic,
    englishConversations: english,
    undetectedLanguageConversations: unknown
  };
}
