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
  media?: { id?: string; mime?: string; caption?: string; filename?: string };
  location?: { latitude?: number; longitude?: number; name?: string; address?: string };
}): Promise<MessageRow | null> {
  const { rows } = await query<MessageRow>(
    `INSERT INTO messages
      (conversation_id, wa_message_id, direction, message_type, body, payload, status,
       media_id, media_mime, media_filename, media_caption,
       location_lat, location_lng, location_name, location_address)
     VALUES ($1, $2, 'inbound', $3, $4, $5::jsonb, 'received',
             $6, $7, $8, $9,
             $10, $11, $12, $13)
     ON CONFLICT (wa_message_id) DO NOTHING
     RETURNING *`,
    [
      args.conversationId,
      args.waMessageId,
      args.messageType,
      args.body,
      JSON.stringify(args.payload),
      args.media?.id ?? null,
      args.media?.mime ?? null,
      args.media?.filename ?? null,
      args.media?.caption ?? null,
      args.location?.latitude ?? null,
      args.location?.longitude ?? null,
      args.location?.name ?? null,
      args.location?.address ?? null
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
