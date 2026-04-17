import { transition } from "../../src/state/stateMachine";

describe("state machine — new contact", () => {
  it("greets with a menu when first message has no category", () => {
    const out = transition({
      currentState: "new",
      currentCategory: null,
      isNewContact: true,
      classifiedCategory: null,
      needsHuman: false,
      language: "ar"
    });
    expect(out.nextState).toBe("awaiting_category");
    expect(out.actions.map((a) => a.kind)).toEqual(["send_welcome"]);
  });

  it("routes immediately if first message already declares intent", () => {
    const out = transition({
      currentState: "new",
      currentCategory: null,
      isNewContact: true,
      classifiedCategory: "hotel_booking",
      needsHuman: false,
      language: "ar"
    });
    expect(out.nextState).toBe("collecting_hotel");
    expect(out.category).toBe("hotel_booking");
    expect(out.tags).toContain("hotel_booking");
    expect(out.actions.map((a) => a.kind)).toEqual(["send_acknowledgement"]);
  });
});

describe("state machine — awaiting category", () => {
  it("resends menu when reply is unrecognized", () => {
    const out = transition({
      currentState: "awaiting_category",
      currentCategory: null,
      isNewContact: false,
      classifiedCategory: null,
      needsHuman: false,
      language: "en"
    });
    expect(out.nextState).toBe("awaiting_category");
    expect(out.actions[0].kind).toBe("send_invalid_option");
  });

  it("routes to vendor and sends portal link", () => {
    const out = transition({
      currentState: "awaiting_category",
      currentCategory: null,
      isNewContact: false,
      classifiedCategory: "vendor",
      needsHuman: false,
      language: "en"
    });
    expect(out.nextState).toBe("collecting_vendor");
    expect(out.category).toBe("vendor");
    expect(out.actions[0].kind).toBe("send_acknowledgement");
  });
});

describe("state machine — handoff", () => {
  it("overrides everything when needsHuman is true", () => {
    const out = transition({
      currentState: "collecting_hotel",
      currentCategory: "hotel_booking",
      isNewContact: false,
      classifiedCategory: null,
      needsHuman: true,
      language: "ar"
    });
    expect(out.nextState).toBe("handed_off");
    expect(out.needsHuman).toBe(true);
    expect(out.actions[0].kind).toBe("send_handoff_notice");
    expect(out.tags).toEqual(expect.arrayContaining(["hotel_booking", "needs_human"]));
  });
});

describe("state machine — category pivot mid-conversation", () => {
  it("switches category when the user changes topic", () => {
    const out = transition({
      currentState: "collecting_hotel",
      currentCategory: "hotel_booking",
      isNewContact: false,
      classifiedCategory: "retail_leasing",
      needsHuman: false,
      language: "ar"
    });
    expect(out.nextState).toBe("collecting_retail");
    expect(out.category).toBe("retail_leasing");
  });
  it("stays in collecting state when no new category detected", () => {
    const out = transition({
      currentState: "collecting_hotel",
      currentCategory: "hotel_booking",
      isNewContact: false,
      classifiedCategory: null,
      needsHuman: false,
      language: "ar"
    });
    expect(out.nextState).toBe("collecting_hotel");
    expect(out.actions).toEqual([]);
  });
});
