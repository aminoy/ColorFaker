import { query } from "../db/pool";

export interface InboxFilter {
  category?: string;
  status?: string;
  assigneeId?: number | null;  // -1 means "unassigned"
  teamId?: number;
  priority?: string;
  needsHuman?: boolean;
  unread?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface InboxRow {
  id: number;
  contact_id: number;
  wa_id: string;
  contact_name: string | null;
  category_code: string | null;
  status: string;
  priority: string;
  needs_human: boolean;
  assignee_id: number | null;
  assignee_email: string | null;
  assignee_name: string | null;
  team_id: number | null;
  tags: string[];
  language: string | null;
  started_at: Date;
  last_message_at: Date;
  first_response_due_at: Date | null;
  resolution_due_at: Date | null;
  first_response_at: Date | null;
  resolved_at: Date | null;
  unread_count: number;
  last_message_body: string | null;
}

export async function searchInbox(
  filter: InboxFilter
): Promise<{ rows: InboxRow[]; total: number }> {
  const params: unknown[] = [];
  const where: string[] = [];

  if (filter.category) {
    params.push(filter.category);
    where.push(`c.category_code = $${params.length}`);
  }
  if (filter.status) {
    params.push(filter.status);
    where.push(`c.status = $${params.length}`);
  }
  if (filter.assigneeId === -1) {
    where.push(`c.assignee_id IS NULL`);
  } else if (filter.assigneeId !== undefined && filter.assigneeId !== null) {
    params.push(filter.assigneeId);
    where.push(`c.assignee_id = $${params.length}`);
  }
  if (filter.teamId !== undefined) {
    params.push(filter.teamId);
    where.push(`c.team_id = $${params.length}`);
  }
  if (filter.priority) {
    params.push(filter.priority);
    where.push(`c.priority = $${params.length}`);
  }
  if (filter.needsHuman) {
    where.push(`c.needs_human = TRUE`);
  }
  if (filter.unread) {
    where.push(`c.unread_count > 0`);
  }
  if (filter.startDate) {
    params.push(filter.startDate);
    where.push(`c.started_at >= $${params.length}`);
  }
  if (filter.endDate) {
    params.push(filter.endDate);
    where.push(`c.started_at < $${params.length}`);
  }
  if (filter.search) {
    params.push(`%${filter.search.toLowerCase()}%`);
    const p = `$${params.length}`;
    where.push(
      `(lower(COALESCE(ct.display_name,'')) LIKE ${p}
        OR lower(ct.wa_id) LIKE ${p}
        OR lower(COALESCE(l.company_name,'')) LIKE ${p}
        OR EXISTS (
            SELECT 1 FROM messages m
             WHERE m.conversation_id = c.id
               AND lower(COALESCE(m.body,'')) LIKE ${p}
               LIMIT 1))`
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const offset = Math.max(filter.offset ?? 0, 0);
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const sql = `
    WITH latest AS (
      SELECT DISTINCT ON (conversation_id) conversation_id, body, created_at
        FROM messages
       ORDER BY conversation_id, created_at DESC
    )
    SELECT
      c.id,
      c.contact_id,
      ct.wa_id,
      ct.display_name AS contact_name,
      c.category_code,
      c.status,
      c.priority,
      c.needs_human,
      c.assignee_id,
      u.email        AS assignee_email,
      u.display_name AS assignee_name,
      c.team_id,
      c.tags,
      c.language,
      c.started_at,
      c.last_message_at,
      c.first_response_due_at,
      c.resolution_due_at,
      c.first_response_at,
      c.resolved_at,
      c.unread_count,
      latest.body AS last_message_body,
      COUNT(*) OVER() AS total_count
    FROM conversations c
    JOIN contacts ct  ON ct.id = c.contact_id
    LEFT JOIN leads l ON l.conversation_id = c.id
    LEFT JOIN users u ON u.id = c.assignee_id
    LEFT JOIN latest  ON latest.conversation_id = c.id
    ${whereSql}
    ORDER BY c.last_message_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

  const { rows } = await query<InboxRow & { total_count: string }>(sql, params);
  return {
    rows: rows.map(({ total_count: _t, ...r }) => r as InboxRow),
    total: rows.length > 0 ? Number(rows[0].total_count) : 0
  };
}

export interface ConversationTimeline {
  conversation: Record<string, unknown> & {
    id: number;
    last_customer_message_at: Date | null;
  };
  messages: Record<string, unknown>[];
  lead: Record<string, unknown> | null;
}

export async function getConversationTimeline(
  conversationId: number
): Promise<ConversationTimeline | null> {
  const conv = await query<ConversationTimeline["conversation"]>(
    `SELECT c.*, ct.wa_id, ct.display_name
      FROM conversations c JOIN contacts ct ON ct.id = c.contact_id
      WHERE c.id = $1`,
    [conversationId]
  );
  if (conv.rowCount === 0) return null;

  const messages = await query<Record<string, unknown>>(
    `SELECT m.*, u.email AS author_email, u.display_name AS author_name
       FROM messages m
       LEFT JOIN users u ON u.id = m.author_user_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC`,
    [conversationId]
  );
  const lead = await query<Record<string, unknown>>(
    `SELECT * FROM leads WHERE conversation_id = $1`,
    [conversationId]
  );
  return {
    conversation: conv.rows[0],
    messages: messages.rows,
    lead: lead.rows[0] ?? null
  };
}
