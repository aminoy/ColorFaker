import axios from "axios";
import { env } from "../../config/env";
import type { CrmAdapter, CrmLeadPayload, CrmSyncResult } from "./types";

/**
 * Generic outbound webhook CRM adapter. Posts the CrmLeadPayload as JSON to
 * `CRM_WEBHOOK_URL` with an optional `Authorization` header.
 * Suitable for Zapier / Make / custom CRM ingest endpoints.
 */
export class WebhookCrmAdapter implements CrmAdapter {
  readonly name = "webhook";

  async syncLead(payload: CrmLeadPayload): Promise<CrmSyncResult> {
    if (!env.CRM_WEBHOOK_URL) {
      return { status: "failed", error: "CRM_WEBHOOK_URL not configured" };
    }
    try {
      const resp = await axios.post(env.CRM_WEBHOOK_URL, payload, {
        timeout: 15_000,
        headers: env.CRM_WEBHOOK_AUTH_HEADER
          ? { Authorization: env.CRM_WEBHOOK_AUTH_HEADER }
          : undefined
      });
      return {
        status: "success",
        externalId:
          (resp.data as { id?: string | number; external_id?: string | number })?.id?.toString() ??
          (resp.data as { external_id?: string | number })?.external_id?.toString() ??
          null,
        response: { status: resp.status, data: resp.data }
      };
    } catch (err) {
      const anyErr = err as { message?: string; response?: { status?: number; data?: unknown } };
      return {
        status: "failed",
        error: anyErr.message ?? "webhook_error",
        response: anyErr.response
          ? { status: anyErr.response.status, data: anyErr.response.data }
          : undefined
      };
    }
  }
}
