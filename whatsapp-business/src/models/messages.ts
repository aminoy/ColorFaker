import { query } from "../db/pool";

export interface MessageRow {
  id: number;
  conversation_id: number;
  wa_message_id: string | null;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string | null;
  payload: Record<string, unknown>;
  status: string | null;
  error: string | null;
  created_at: Date;
}

export async function insertInboundMessage(args: {
  conversationId: number;
  waMessageId: string | null;
  messageType: string;
  body: string | null;
  payload: Record<string, unknown>;
}): Promise<MessageRow | null> {
  const { rows } = await query<MessageRow>(
    `INSERT INTO messages
      (conversation_id, wa_message_id, direction, message_type, body, payload, status)
     VALUES ($1, $2, 'inbound', $3, $4, $5::jsonb, 'received')
     ON CONFLICT (wa_message_id) DO NOTHING
     RETURNING *`,
    [
      args.conversationId,
      args.waMessageId,
      args.messageType,
      args.body,
      JSON.stringify(args.payload)
    ]
  );
  return rows[0] ?? null;
}

export async function insertOutboundMessage(args: {
  conversationId: number;
  waMessageId: string | null;
  messageType: string;
  body: string | null;
  payload: Record<string, unknown>;
  status?: string;
  error?: string;
}): Promise<MessageRow> {
  const { rows } = await query<MessageRow>(
    `INSERT INTO messages
      (conversation_id, wa_message_id, direction, message_type, body, payload, status, error)
     VALUES ($1, $2, 'outbound', $3, $4, $5::jsonb, $6, $7)
     RETURNING *`,
    [
      args.conversationId,
      args.waMessageId,
      args.messageType,
      args.body,
      JSON.stringify(args.payload),
      args.status ?? "sent",
      args.error ?? null
    ]
  );
  return rows[0];
}

export async function updateMessageStatus(
  waMessageId: string,
  status: string,
  error?: string
): Promise<void> {
  await query(
    `UPDATE messages SET status = $2, error = $3 WHERE wa_message_id = $1`,
    [waMessageId, status, error ?? null]
  );
}
