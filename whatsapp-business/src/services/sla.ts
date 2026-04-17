import { query } from "../db/pool";
import { setSlaDeadlines } from "../models/conversations";
import type { CategoryCode, Priority } from "../types/domain";

export interface SlaRule {
  id: number;
  category_code: CategoryCode | null;
  priority: Priority | null;
  first_response_minutes: number;
  resolution_minutes: number;
  description: string | null;
  is_active: boolean;
}

export interface SlaDeadlines {
  first_response_due_at: Date | null;
  resolution_due_at: Date | null;
  rule: SlaRule | null;
}

/**
 * Pick the best matching active rule for a (category, priority) pair.
 * Precedence: exact category + exact priority > exact category + null priority > null category.
 */
export function pickRule(rules: SlaRule[], category: CategoryCode | null, priority: Priority): SlaRule | null {
  const active = rules.filter((r) => r.is_active);
  return (
    active.find((r) => r.category_code === category && r.priority === priority) ??
    active.find((r) => r.category_code === category && r.priority === null) ??
    active.find((r) => r.category_code === null && r.priority === priority) ??
    active.find((r) => r.category_code === null && r.priority === null) ??
    null
  );
}

export function computeDeadlines(rule: SlaRule | null, startedAt: Date): SlaDeadlines {
  if (!rule) return { first_response_due_at: null, resolution_due_at: null, rule: null };
  return {
    first_response_due_at: new Date(startedAt.getTime() + rule.first_response_minutes * 60_000),
    resolution_due_at: new Date(startedAt.getTime() + rule.resolution_minutes * 60_000),
    rule
  };
}

export async function loadRules(): Promise<SlaRule[]> {
  const { rows } = await query<SlaRule>(
    `SELECT id, category_code, priority, first_response_minutes, resolution_minutes, description, is_active
       FROM sla_rules WHERE is_active = TRUE`
  );
  return rows;
}

/**
 * Compute & persist SLA deadlines for the given conversation based on its
 * current (category, priority, started_at).
 */
export async function applyDeadlines(conversationId: number): Promise<SlaDeadlines> {
  const rules = await loadRules();
  const { rows } = await query<{
    category_code: CategoryCode | null;
    priority: Priority;
    started_at: Date;
  }>(
    `SELECT category_code, priority, started_at FROM conversations WHERE id = $1`,
    [conversationId]
  );
  if (rows.length === 0) {
    return { first_response_due_at: null, resolution_due_at: null, rule: null };
  }
  const { category_code, priority, started_at } = rows[0];
  const rule = pickRule(rules, category_code, priority);
  const deadlines = computeDeadlines(rule, new Date(started_at));
  await setSlaDeadlines(conversationId, deadlines.first_response_due_at, deadlines.resolution_due_at);
  return deadlines;
}

export interface SlaRiskRow {
  id: number;
  category_code: string | null;
  priority: string;
  status: string;
  first_response_due_at: Date | null;
  resolution_due_at: Date | null;
  first_response_at: Date | null;
  resolved_at: Date | null;
  minutes_until_first_response_due: number | null;
  minutes_until_resolution_due: number | null;
  first_response_breached: boolean;
  resolution_breached: boolean;
}

export async function listSlaRisks(): Promise<SlaRiskRow[]> {
  const { rows } = await query<SlaRiskRow>(
    `SELECT
       id, category_code, priority, status,
       first_response_due_at, resolution_due_at,
       first_response_at, resolved_at,
       CASE WHEN first_response_at IS NULL AND first_response_due_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (first_response_due_at - NOW()))/60
            ELSE NULL END AS minutes_until_first_response_due,
       CASE WHEN resolved_at IS NULL AND resolution_due_at IS NOT NULL
            THEN EXTRACT(EPOCH FROM (resolution_due_at - NOW()))/60
            ELSE NULL END AS minutes_until_resolution_due,
       (first_response_at IS NULL AND first_response_due_at IS NOT NULL AND first_response_due_at < NOW())   AS first_response_breached,
       (resolved_at      IS NULL AND resolution_due_at      IS NOT NULL AND resolution_due_at      < NOW())  AS resolution_breached
       FROM conversations
      WHERE status NOT IN ('resolved','closed','archived')
        AND (first_response_due_at IS NOT NULL OR resolution_due_at IS NOT NULL)
      ORDER BY LEAST(
         COALESCE(first_response_due_at, resolution_due_at, NOW() + interval '10 year'),
         COALESCE(resolution_due_at,   first_response_due_at, NOW() + interval '10 year')
      ) ASC`
  );
  return rows;
}
