export type CategoryCode =
  | "hotel_booking"
  | "retail_leasing"
  | "vendor"
  | "general_inquiry";

export type Language = "ar" | "en";

export type ConversationState =
  | "new"
  | "awaiting_category"
  | "collecting_hotel"
  | "collecting_retail"
  | "collecting_vendor"
  | "collecting_general"
  | "handed_off"
  | "resolved";

export interface Contact {
  id: number;
  wa_id: string;
  display_name: string | null;
  locale: Language | null;
  first_seen_at: Date;
  last_seen_at: Date;
  opted_out: boolean;
  metadata: Record<string, unknown>;
}

export type OperationalStatus =
  | "new"
  | "bot_handled"
  | "pending_human"
  | "in_progress"
  | "waiting_on_customer"
  | "resolved"
  | "archived"
  // Legacy values from v1 schema; still valid strings.
  | "open"
  | "closed";

export type Priority = "low" | "normal" | "high" | "urgent";

export interface Conversation {
  id: number;
  contact_id: number;
  category_code: CategoryCode | null;
  state: ConversationState;
  language: Language | null;
  status: OperationalStatus;
  needs_human: boolean;
  assigned_agent: string | null;
  priority: Priority;
  assignee_id: number | null;
  team_id: number | null;
  first_response_due_at: Date | null;
  resolution_due_at: Date | null;
  unread_count: number;
  last_customer_message_at: Date | null;
  started_at: Date;
  first_response_at: Date | null;
  last_message_at: Date;
  resolved_at: Date | null;
  internal_notes: string | null;
  tags: string[];
}

export type InboundMessageType =
  | "text"
  | "interactive"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "sticker"
  | "location";

export interface InboundMedia {
  id?: string;
  mime?: string;
  caption?: string;
  filename?: string;
}

export interface InboundLocation {
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
}

export interface InboundTextMessage {
  wa_message_id: string;
  from: string;               // wa_id
  profile_name?: string;
  text: string;               // human-readable representation for logs/routing
  message_type: InboundMessageType;
  media?: InboundMedia;
  location?: InboundLocation;
  timestamp: Date;
  raw: Record<string, unknown>;
}
