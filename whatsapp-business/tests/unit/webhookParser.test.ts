import fs from "fs";
import path from "path";
import { extractEvents, parseWebhook } from "../../src/services/webhookParser";

function load(name: string) {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `../fixtures/${name}`), "utf8")
  );
}

describe("webhookParser", () => {
  it("extracts text messages from Meta fixture", () => {
    const payload = parseWebhook(load("inbound-text-arabic.json"));
    const { inboundTextMessages } = extractEvents(payload);
    expect(inboundTextMessages).toHaveLength(1);
    expect(inboundTextMessages[0].text).toContain("حجز");
    expect(inboundTextMessages[0].from).toBeTruthy();
    expect(inboundTextMessages[0].wa_message_id).toBeTruthy();
  });

  it("handles interactive list replies", () => {
    const payload = parseWebhook(load("inbound-list-reply.json"));
    const { inboundTextMessages } = extractEvents(payload);
    expect(inboundTextMessages).toHaveLength(1);
    expect(inboundTextMessages[0].text).toMatch(/hotel|فندق/i);
  });

  it("extracts status updates", () => {
    const payload = parseWebhook(load("status-delivered.json"));
    const { statuses, inboundTextMessages } = extractEvents(payload);
    expect(inboundTextMessages).toHaveLength(0);
    expect(statuses).toHaveLength(1);
    expect(statuses[0].status).toBe("delivered");
  });
});
