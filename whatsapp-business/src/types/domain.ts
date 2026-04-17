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

export interface Conversation {
  id: number;
  contact_id: number;
  category_code: CategoryCode | null;
  state: ConversationState;
  language: Language | null;
  status: "open" | "closed" | "archived";
  needs_human: boolean;
  assigned_agent: string | null;
  started_at: Date;
  first_response_at: Date | null;
  last_message_at: Date;
  resolved_at: Date | null;
  internal_notes: string | null;
  tags: string[];
}

export interface InboundTextMessage {
  wa_message_id: string;
  from: string;               // wa_id
  profile_name?: string;
  text: string;
  timestamp: Date;
  raw: Record<string, unknown>;
}
