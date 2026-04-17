import { query } from "../db/pool";

export interface FollowUp {
  id: number;
  conversation_id: number;
  owner_user_id: number | null;
  due_at: Date;
  note: string | null;
  status: "pending" | "done" | "cancelled";
  completed_at: Date | null;
  created_by: number | null;
  created_at: Date;
  owner_email?: string | null;
  owner_name?: string | null;
}

export async function createFollowUp(args: {
  conversationId: number;
  ownerUserId: number | null;
  dueAt: Date;
  note?: string | null;
  createdBy: number | null;
}): Promise<FollowUp> {
  const { rows } = await query<FollowUp>(
    `INSERT INTO follow_ups (conversation_id, owner_user_id, due_at, note, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [args.conversationId, args.ownerUserId, args.dueAt, args.note ?? null, args.createdBy]
  );
  return rows[0];
}

export async function completeFollowUp(id: number): Promise<void> {
  await query(
    `UPDATE follow_ups
        SET status = 'done', completed_at = NOW()
      WHERE id = $1 AND status = 'pending'`,
    [id]
  );
}

export async function cancelFollowUp(id: number): Promise<void> {
  await query(
    `UPDATE follow_ups
        SET status = 'cancelled'
      WHERE id = $1 AND status = 'pending'`,
    [id]
  );
}

export async function listFollowUps(filter: {
  ownerUserId?: number;
  conversationId?: number;
  status?: "pending" | "done" | "cancelled";
  overdueOnly?: boolean;
  limit?: number;
}): Promise<FollowUp[]> {
  const params: unknown[] = [];
  const where: string[] = [];
  if (filter.ownerUserId !== undefined) {
    params.push(filter.ownerUserId);
    where.push(`f.owner_user_id = $${params.length}`);
  }
  if (filter.conversationId !== undefined) {
    params.push(filter.conversationId);
    where.push(`f.conversation_id = $${params.length}`);
  }
  if (filter.status) {
    params.push(filter.status);
    where.push(`f.status = $${params.length}`);
  }
  if (filter.overdueOnly) {
    where.push(`f.status = 'pending' AND f.due_at < NOW()`);
  }
  params.push(filter.limit ?? 200);
  const sql = `
    SELECT f.*,
           u.email        AS owner_email,
           u.display_name AS owner_name
      FROM follow_ups f
      LEFT JOIN users u ON u.id = f.owner_user_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY f.due_at ASC
     LIMIT $${params.length}`;
  const { rows } = await query<FollowUp>(sql, params);
  return rows;
}
