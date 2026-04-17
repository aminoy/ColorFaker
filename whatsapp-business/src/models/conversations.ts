import { query } from "../db/pool";
import type {
  CategoryCode,
  Conversation,
  ConversationState,
  Language
} from "../types/domain";

export async function getOpenConversation(contactId: number): Promise<Conversation | null> {
  const { rows } = await query<Conversation>(
    `SELECT * FROM conversations
      WHERE contact_id = $1 AND status = 'open'
      ORDER BY started_at DESC LIMIT 1`,
    [contactId]
  );
  return rows[0] ?? null;
}

export async function createConversation(
  contactId: number,
  language: Language | null
): Promise<Conversation> {
  const { rows } = await query<Conversation>(
    `INSERT INTO conversations (contact_id, language, state)
     VALUES ($1, $2, 'new')
     RETURNING *`,
    [contactId, language]
  );
  return rows[0];
}

export async function updateConversationState(
  id: number,
  state: ConversationState,
  extras: Partial<{
    category_code: CategoryCode;
    needs_human: boolean;
    tags: string[];
    language: Language;
  }> = {}
): Promise<Conversation> {
  const sets: string[] = ["state = $2", "last_message_at = NOW()"];
  const params: unknown[] = [id, state];
  let i = 3;
  if (extras.category_code) {
    sets.push(`category_code = $${i++}`);
    params.push(extras.category_code);
  }
  if (extras.needs_human !== undefined) {
    sets.push(`needs_human = $${i++}`);
    params.push(extras.needs_human);
  }
  if (extras.tags) {
    sets.push(`tags = $${i++}`);
    params.push(extras.tags);
  }
  if (extras.language) {
    sets.push(`language = $${i++}`);
    params.push(extras.language);
  }
  const { rows } = await query<Conversation>(
    `UPDATE conversations SET ${sets.join(", ")} WHERE id = $1 RETURNING *`,
    params
  );
  return rows[0];
}

export async function markFirstResponse(id: number): Promise<void> {
  await query(
    `UPDATE conversations
        SET first_response_at = COALESCE(first_response_at, NOW())
      WHERE id = $1`,
    [id]
  );
}

export async function appendInternalNote(id: number, note: string): Promise<void> {
  await query(
    `UPDATE conversations
        SET internal_notes = COALESCE(internal_notes, '') || $2
      WHERE id = $1`,
    [id, `\n[${new Date().toISOString()}] ${note}`]
  );
}

export async function resolveConversation(id: number): Promise<void> {
  await query(
    `UPDATE conversations
        SET status = 'closed',
            state = 'resolved',
            resolved_at = NOW()
      WHERE id = $1`,
    [id]
  );
}
