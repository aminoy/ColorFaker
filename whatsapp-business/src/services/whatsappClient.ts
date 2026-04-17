import axios, { AxiosError, AxiosInstance } from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface SendTextArgs {
  to: string;                  // wa_id (E.164 digits, no '+')
  body: string;
  previewUrl?: boolean;
  contextMessageId?: string;   // reply context
}

export interface SendInteractiveListArgs {
  to: string;
  bodyText: string;
  buttonText: string;
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}

export interface SendTemplateArgs {
  to: string;
  templateName: string;
  languageCode: string;         // e.g. "ar", "en_US"
  bodyParameters?: string[];    // positional {{1}}, {{2}}, ...
}

export interface WhatsAppSendResponse {
  messages: Array<{ id: string }>;
  contacts: Array<{ input: string; wa_id: string }>;
}

/**
 * Thin WhatsApp Cloud API client with retry-safe logic.
 * Retries are done with exponential backoff on 5xx and network errors only.
 */
export class WhatsAppClient {
  private http: AxiosInstance;
  private readonly url: string;

  constructor(opts?: { httpClient?: AxiosInstance }) {
    this.url = `${env.WHATSAPP_API_BASE_URL}/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    this.http =
      opts?.httpClient ??
      axios.create({
        timeout: 15_000,
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      });
  }

  async sendText(args: SendTextArgs): Promise<WhatsAppSendResponse> {
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: args.to,
      type: "text",
      text: { body: args.body, preview_url: args.previewUrl ?? false }
    };
    if (args.contextMessageId) {
      payload.context = { message_id: args.contextMessageId };
    }
    return this.postWithRetry(payload);
  }

  async sendInteractiveList(args: SendInteractiveListArgs): Promise<WhatsAppSendResponse> {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: args.to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: args.bodyText },
        action: { button: args.buttonText, sections: args.sections }
      }
    };
    return this.postWithRetry(payload);
  }

  async sendTemplate(args: SendTemplateArgs): Promise<WhatsAppSendResponse> {
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: args.to,
      type: "template",
      template: {
        name: args.templateName,
        language: { code: args.languageCode },
        components:
          args.bodyParameters && args.bodyParameters.length
            ? [
                {
                  type: "body",
                  parameters: args.bodyParameters.map((t) => ({ type: "text", text: t }))
                }
              ]
            : []
      }
    };
    return this.postWithRetry(payload);
  }

  /**
   * Low-level send returning the axios response so callers can classify errors.
   * Used by the outbound queue worker which needs Meta's error codes.
   */
  async sendRaw(
    payload: unknown
  ): Promise<{ status: number; data: unknown; ok: boolean }> {
    try {
      const resp = await this.http.post(this.url, payload);
      return { status: resp.status, data: resp.data, ok: true };
    } catch (err) {
      const axerr = err as AxiosError;
      if (axerr.response) {
        return { status: axerr.response.status, data: axerr.response.data, ok: false };
      }
      return { status: 0, data: { error: { message: axerr.message } }, ok: false };
    }
  }

  private async postWithRetry(
    payload: unknown,
    maxAttempts = 4
  ): Promise<WhatsAppSendResponse> {
    let attempt = 0;
    let lastErr: unknown;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        const resp = await this.http.post<WhatsAppSendResponse>(this.url, payload);
        return resp.data;
      } catch (err) {
        lastErr = err;
        const axerr = err as AxiosError;
        const status = axerr.response?.status;
        const retriable = !status || (status >= 500 && status < 600);
        logger.warn(
          {
            attempt,
            status,
            data: axerr.response?.data,
            msg: axerr.message
          },
          "whatsapp.send.error"
        );
        if (!retriable) break;
        const delayMs = Math.min(2 ** attempt * 500, 8_000);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  }
}

export const whatsappClient = new WhatsAppClient();
