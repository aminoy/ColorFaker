import fs from "fs";
import path from "path";
import { extractEvents, parseWebhook } from "../../src/services/webhookParser";

function load(name: string) {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, `../fixtures/${name}`), "utf8"));
}

describe("webhookParser media + location", () => {
  it("extracts image with caption", () => {
    const { inboundTextMessages } = extractEvents(parseWebhook(load("inbound-image.json")));
    expect(inboundTextMessages).toHaveLength(1);
    const m = inboundTextMessages[0];
    expect(m.message_type).toBe("image");
    expect(m.media?.id).toBe("MEDIA_ID_IMG");
    expect(m.media?.mime).toBe("image/jpeg");
    expect(m.text).toContain("صورة");
  });

  it("extracts document with filename", () => {
    const { inboundTextMessages } = extractEvents(parseWebhook(load("inbound-document.json")));
    const m = inboundTextMessages[0];
    expect(m.message_type).toBe("document");
    expect(m.media?.filename).toBe("vendor-profile.pdf");
    expect(m.media?.mime).toBe("application/pdf");
  });

  it("extracts location with coordinates and name", () => {
    const { inboundTextMessages } = extractEvents(parseWebhook(load("inbound-location.json")));
    const m = inboundTextMessages[0];
    expect(m.message_type).toBe("location");
    expect(m.location?.latitude).toBeCloseTo(21.4225);
    expect(m.location?.longitude).toBeCloseTo(39.8262);
    expect(m.text).toContain("Jabal Omar");
  });
});
