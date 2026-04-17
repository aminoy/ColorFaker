import type { CrmAdapter, CrmLeadPayload, CrmSyncResult } from "./types";

/**
 * In-memory CRM adapter for local development and tests.
 * Exposes the captured leads so tests can assert what was sent.
 */
export class MockCrmAdapter implements CrmAdapter {
  readonly name = "mock";
  public readonly captured: CrmLeadPayload[] = [];
  public failNextN = 0; // used by tests to simulate transient failures

  async syncLead(payload: CrmLeadPayload): Promise<CrmSyncResult> {
    if (this.failNextN > 0) {
      this.failNextN--;
      return { status: "failed", error: "simulated_failure" };
    }
    this.captured.push(payload);
    return {
      status: "success",
      externalId: `mock-${payload.lead_id}`,
      response: { stored: true }
    };
  }

  reset(): void {
    this.captured.length = 0;
    this.failNextN = 0;
  }
}
