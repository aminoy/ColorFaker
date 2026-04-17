import { query } from "../db/pool";

export interface ConversationNote {
  id: number;
  conversation_id: number;
  author_user_id: number | null;
  body: string;
  created_at: Date;
  author_email?: string | null;
  author_name?: string | null;
}

export async function createNote(
  conversationId: number,
  authorUserId: number | null,
  body: string
): Promise<ConversationNote> {
  const { rows } = await query<ConversationNote>(
    `INSERT INTO conversation_notes (conversation_id, author_user_id, body)
     VALUES ($1, $2, $3) RETURNING *`,
    [conversationId, authorUserId, body]
  );
  return rows[0];
}

export async function listNotes(conversationId: number): Promise<ConversationNote[]> {
  const { rows } = await query<ConversationNote>(
    `SELECT n.*, u.email AS author_email, u.display_name AS author_name
       FROM conversation_notes n
       LEFT JOIN users u ON u.id = n.author_user_id
      WHERE n.conversation_id = $1
      ORDER BY n.created_at ASC`,
    [conversationId]
  );
  return rows;
}
