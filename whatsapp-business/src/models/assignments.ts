import { query, withTransaction } from "../db/pool";

export interface Assignment {
  id: number;
  conversation_id: number;
  assignee_id: number | null;
  team_id: number | null;
  assigned_by: number | null;
  reason: string | null;
  created_at: Date;
  assignee_email?: string | null;
  assignee_name?: string | null;
}

/**
 * Reassigns a conversation to a user (and/or team), recording the change.
 */
export async function assignConversation(
  conversationId: number,
  assigneeId: number | null,
  teamId: number | null,
  assignedBy: number | null,
  reason?: string
): Promise<Assignment> {
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE conversations
          SET assignee_id = $2,
              team_id = COALESCE($3, team_id)
        WHERE id = $1`,
      [conversationId, assigneeId, teamId]
    );
    const { rows } = await client.query<Assignment>(
      `INSERT INTO assignments (conversation_id, assignee_id, team_id, assigned_by, reason)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [conversationId, assigneeId, teamId, assignedBy, reason ?? null]
    );
    return rows[0];
  });
}

export async function listAssignments(conversationId: number): Promise<Assignment[]> {
  const { rows } = await query<Assignment>(
    `SELECT a.*,
            u.email        AS assignee_email,
            u.display_name AS assignee_name
       FROM assignments a
       LEFT JOIN users u ON u.id = a.assignee_id
      WHERE a.conversation_id = $1
      ORDER BY a.created_at ASC`,
    [conversationId]
  );
  return rows;
}
