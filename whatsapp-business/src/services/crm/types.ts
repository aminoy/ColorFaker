export interface CrmLeadPayload {
  lead_id: number;
  conversation_id: number;
  contact: {
    wa_id: string;
    display_name: string | null;
    language: string | null;
  };
  category: string;
  fields: Record<string, unknown>;
  tags: string[];
  created_at: string;
}

export interface CrmSyncResult {
  status: "success" | "failed";
  externalId?: string | null;
  response?: Record<string, unknown>;
  error?: string;
}

export interface CrmAdapter {
  readonly name: string;
  syncLead(payload: CrmLeadPayload): Promise<CrmSyncResult>;
}
