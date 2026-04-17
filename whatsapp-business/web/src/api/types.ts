export type Role = "admin" | "manager" | "agent" | "viewer";

export interface Me {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  team_id: number | null;
}

export interface InboxRow {
  id: number;
  contact_id: number;
  wa_id: string;
  contact_name: string | null;
  category_code: string | null;
  status: string;
  priority: string;
  needs_human: boolean;
  assignee_id: number | null;
  assignee_email: string | null;
  assignee_name: string | null;
  team_id: number | null;
  tags: string[];
  language: string | null;
  started_at: string;
  last_message_at: string;
  first_response_due_at: string | null;
  resolution_due_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  unread_count: number;
  last_message_body: string | null;
}

export interface TimelineResponse {
  conversation: Record<string, unknown> & {
    id: number;
    status: string;
    priority: string;
    category_code: string | null;
    tags: string[];
    last_customer_message_at: string | null;
    assignee_id: number | null;
    contact_id: number;
    wa_id: string;
    display_name: string | null;
  };
  messages: Array<{
    id: number;
    direction: "inbound" | "outbound";
    body: string | null;
    created_at: string;
    message_type: string;
    media_id?: string | null;
    media_mime?: string | null;
    media_filename?: string | null;
    media_caption?: string | null;
    location_lat?: number | null;
    location_lng?: number | null;
    location_name?: string | null;
    location_address?: string | null;
    author_email?: string | null;
    author_name?: string | null;
  }>;
  lead: Record<string, unknown> | null;
  notes: Array<{ id: number; body: string; created_at: string; author_name: string | null }>;
  assignments: Array<{ id: number; assignee_name: string | null; created_at: string }>;
  followUps: Array<{
    id: number;
    due_at: string;
    note: string | null;
    status: string;
    owner_name: string | null;
  }>;
  service_window: { open: boolean; reason: string; expiresAt: string | null };
}

export interface OverviewMetrics {
  totalConversations: number;
  openConversations: number;
  resolvedConversations: number;
  avgFirstResponseSeconds: number | null;
  avgResolutionSeconds: number | null;
  handoffRate: number;
  slaBreaches: number;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  team_id: number | null;
}

export interface CannedReply {
  id: number;
  code: string;
  language: "ar" | "en";
  title: string;
  body: string;
  category_code: string | null;
  is_active: boolean;
}
