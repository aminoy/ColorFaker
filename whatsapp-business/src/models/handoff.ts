import { query } from "../db/pool";

export async function recordHandoff(
  conversationId: number,
  reason: string,
  triggeredBy: "user" | "bot" | "agent" = "bot",
  note?: string
): Promise<void> {
  await query(
    `INSERT INTO handoff_events (conversation_id, reason, triggered_by, note)
     VALUES ($1, $2, $3, $4)`,
    [conversationId, reason, triggeredBy, note ?? null]
  );
  await query(`UPDATE conversations SET needs_human = TRUE WHERE id = $1`, [conversationId]);
}
