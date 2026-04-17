import { query } from "../db/pool";

export interface DashboardRange {
  start: Date;
  end: Date;   // exclusive
}

export function defaultRange(now = new Date()): DashboardRange {
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return { start, end };
}

export interface OverviewMetrics {
  totalConversations: number;
  openConversations: number;
  resolvedConversations: number;
  avgFirstResponseSeconds: number | null;
  avgResolutionSeconds: number | null;
  handoffRate: number;
  slaBreaches: number;
}

export async function overview(range: DashboardRange): Promise<OverviewMetrics> {
  const { rows } = await query<Record<string, string | null>>(
    `SELECT
      COUNT(*) FILTER (WHERE started_at >= $1 AND started_at < $2)::text AS total,
      COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed','archived')
                          AND started_at >= $1 AND started_at < $2)::text AS opened,
      COUNT(*) FILTER (WHERE status IN ('resolved','closed')
                          AND started_at >= $1 AND started_at < $2)::text AS resolved,
      EXTRACT(EPOCH FROM AVG(first_response_at - started_at))::text AS avg_first,
      EXTRACT(EPOCH FROM AVG(resolved_at - started_at))::text AS avg_res,
      (SELECT COUNT(*)::text FROM conversations
         WHERE needs_human = TRUE AND started_at >= $1 AND started_at < $2) AS handoffs,
      (SELECT COUNT(*)::text FROM conversations
         WHERE started_at >= $1 AND started_at < $2
           AND (
             (first_response_at IS NULL AND first_response_due_at IS NOT NULL AND first_response_due_at < NOW())
             OR
             (resolved_at IS NULL AND resolution_due_at IS NOT NULL AND resolution_due_at < NOW())
           )) AS breaches
       FROM conversations
      WHERE started_at >= $1 AND started_at < $2`,
    [range.start.toISOString(), range.end.toISOString()]
  );
  const r = rows[0] ?? {};
  const total = Number(r.total ?? 0);
  const handoffs = Number(r.handoffs ?? 0);
  return {
    totalConversations: total,
    openConversations: Number(r.opened ?? 0),
    resolvedConversations: Number(r.resolved ?? 0),
    avgFirstResponseSeconds: r.avg_first == null ? null : Number(r.avg_first),
    avgResolutionSeconds: r.avg_res == null ? null : Number(r.avg_res),
    handoffRate: total > 0 ? handoffs / total : 0,
    slaBreaches: Number(r.breaches ?? 0)
  };
}

export interface CategoryAnalyticsRow {
  category_code: string | null;
  conversations: number;
  leads: number;
  avg_first_response_seconds: number | null;
  avg_resolution_seconds: number | null;
  breaches: number;
}

export async function byCategory(range: DashboardRange): Promise<CategoryAnalyticsRow[]> {
  const { rows } = await query<CategoryAnalyticsRow & { conversations: string; leads: string; breaches: string }>(
    `SELECT
        c.category_code,
        COUNT(*)::text AS conversations,
        (SELECT COUNT(*) FROM leads l
           WHERE l.category_code = c.category_code
             AND l.created_at >= $1 AND l.created_at < $2)::text AS leads,
        EXTRACT(EPOCH FROM AVG(c.first_response_at - c.started_at)) AS avg_first_response_seconds,
        EXTRACT(EPOCH FROM AVG(c.resolved_at - c.started_at))       AS avg_resolution_seconds,
        COUNT(*) FILTER (WHERE
              (c.first_response_at IS NULL AND c.first_response_due_at IS NOT NULL AND c.first_response_due_at < NOW())
           OR (c.resolved_at      IS NULL AND c.resolution_due_at      IS NOT NULL AND c.resolution_due_at      < NOW())
        )::text AS breaches
       FROM conversations c
      WHERE c.started_at >= $1 AND c.started_at < $2
      GROUP BY c.category_code
      ORDER BY COUNT(*) DESC`,
    [range.start.toISOString(), range.end.toISOString()]
  );
  return rows.map((r) => ({
    category_code: r.category_code,
    conversations: Number(r.conversations),
    leads: Number(r.leads),
    avg_first_response_seconds: r.avg_first_response_seconds,
    avg_resolution_seconds: r.avg_resolution_seconds,
    breaches: Number(r.breaches)
  }));
}

export interface TeamPerformanceRow {
  user_id: number | null;
  email: string | null;
  display_name: string | null;
  assigned_open: number;
  resolved: number;
  replies_sent: number;
  avg_first_response_seconds: number | null;
}

export async function teamPerformance(range: DashboardRange): Promise<TeamPerformanceRow[]> {
  const { rows } = await query<TeamPerformanceRow & { assigned_open: string; resolved: string; replies_sent: string }>(
    `SELECT
        u.id              AS user_id,
        u.email,
        u.display_name,
        COUNT(*) FILTER (WHERE c.status NOT IN ('resolved','closed','archived')
                            AND c.assignee_id = u.id)::text AS assigned_open,
        COUNT(*) FILTER (WHERE c.resolved_at >= $1 AND c.resolved_at < $2
                            AND c.assignee_id = u.id)::text AS resolved,
        (SELECT COUNT(*)
            FROM messages m
           WHERE m.direction = 'outbound'
             AND m.author_user_id = u.id
             AND m.created_at >= $1 AND m.created_at < $2)::text AS replies_sent,
        EXTRACT(EPOCH FROM AVG(c.first_response_at - c.started_at)) FILTER (
          WHERE c.started_at >= $1 AND c.started_at < $2 AND c.assignee_id = u.id
        ) AS avg_first_response_seconds
       FROM users u
       LEFT JOIN conversations c ON c.assignee_id = u.id
      GROUP BY u.id, u.email, u.display_name
      ORDER BY u.display_name`,
    [range.start.toISOString(), range.end.toISOString()]
  );
  return rows.map((r) => ({
    user_id: r.user_id,
    email: r.email,
    display_name: r.display_name,
    assigned_open: Number(r.assigned_open),
    resolved: Number(r.resolved),
    replies_sent: Number(r.replies_sent),
    avg_first_response_seconds: r.avg_first_response_seconds
  }));
}

export interface LeadAnalyticsRow {
  category_code: string;
  total: number;
  with_contact: number;
  with_email: number;
}

export async function leadAnalytics(range: DashboardRange): Promise<LeadAnalyticsRow[]> {
  const { rows } = await query<LeadAnalyticsRow & { total: string; with_contact: string; with_email: string }>(
    `SELECT
       category_code,
       COUNT(*)::text AS total,
       COUNT(*) FILTER (WHERE contact_number IS NOT NULL)::text AS with_contact,
       COUNT(*) FILTER (WHERE email IS NOT NULL)::text AS with_email
      FROM leads
     WHERE created_at >= $1 AND created_at < $2
     GROUP BY category_code
     ORDER BY COUNT(*) DESC`,
    [range.start.toISOString(), range.end.toISOString()]
  );
  return rows.map((r) => ({
    category_code: r.category_code,
    total: Number(r.total),
    with_contact: Number(r.with_contact),
    with_email: Number(r.with_email)
  }));
}

export async function backlog(): Promise<{
  unassigned: number;
  pending_human: number;
  waiting_customer: number;
  overdue_first_response: number;
  overdue_resolution: number;
}> {
  const { rows } = await query<Record<string, string>>(
    `SELECT
        COUNT(*) FILTER (WHERE assignee_id IS NULL AND status NOT IN ('resolved','closed','archived'))::text AS unassigned,
        COUNT(*) FILTER (WHERE status = 'pending_human')::text AS pending_human,
        COUNT(*) FILTER (WHERE status = 'waiting_on_customer')::text AS waiting_customer,
        COUNT(*) FILTER (WHERE first_response_at IS NULL AND first_response_due_at IS NOT NULL AND first_response_due_at < NOW())::text AS overdue_first_response,
        COUNT(*) FILTER (WHERE resolved_at      IS NULL AND resolution_due_at      IS NOT NULL AND resolution_due_at      < NOW())::text AS overdue_resolution
       FROM conversations`
  );
  const r = rows[0];
  return {
    unassigned: Number(r.unassigned),
    pending_human: Number(r.pending_human),
    waiting_customer: Number(r.waiting_customer),
    overdue_first_response: Number(r.overdue_first_response),
    overdue_resolution: Number(r.overdue_resolution)
  };
}

export function toCsvRows(header: string[], rows: Record<string, unknown>[]): string {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(header.map((k) => esc(r[k])).join(","));
  }
  return lines.join("\n") + "\n";
}
