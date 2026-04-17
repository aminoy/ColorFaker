import { classify, detectCategory, detectHandoff } from "../../src/services/intent";

describe("intent.detectCategory", () => {
  it("maps ASCII and Arabic-Indic digits to categories", () => {
    expect(detectCategory("1")).toBe("hotel_booking");
    expect(detectCategory("٢")).toBe("retail_leasing");
    expect(detectCategory("3")).toBe("vendor");
    expect(detectCategory("٤")).toBe("general_inquiry");
  });

  it("detects menu-style answers like 'option 2'", () => {
    expect(detectCategory("Option 2 please")).toBe("retail_leasing");
    expect(detectCategory("1)")).toBe("hotel_booking");
  });

  it("detects Arabic hotel booking keywords", () => {
    expect(detectCategory("أرغب في حجز غرفة في الفندق")).toBe("hotel_booking");
    expect(detectCategory("حجوزات الفنادق رجاء")).toBe("hotel_booking");
  });

  it("detects Arabic retail leasing keywords", () => {
    expect(detectCategory("نحن مهتمون بتأجير محل في المول")).toBe("retail_leasing");
    expect(detectCategory("إيجار كشك")).toBe("retail_leasing");
  });

  it("detects Arabic vendor keywords", () => {
    expect(detectCategory("نحن موردون ونقدم خدمات صيانة")).toBe("vendor");
  });

  it("detects English equivalents", () => {
    expect(detectCategory("I want to book a hotel room")).toBe("hotel_booking");
    expect(detectCategory("We'd like to rent a shop")).toBe("retail_leasing");
    expect(detectCategory("We are a supplier / vendor")).toBe("vendor");
    expect(detectCategory("General question about opening hours")).toBe("general_inquiry");
  });

  it("returns null when nothing matches", () => {
    expect(detectCategory("asdkljhasd lkjasdf")).toBeNull();
    expect(detectCategory("")).toBeNull();
  });
});

describe("intent.detectHandoff", () => {
  it("flags Arabic complaint keywords", () => {
    expect(detectHandoff("عندي شكوى على الحجز").needsHuman).toBe(true);
    expect(detectHandoff("أريد التحدث مع موظف").needsHuman).toBe(true);
  });
  it("flags English complaint / human keywords", () => {
    expect(detectHandoff("I want to talk to a human").needsHuman).toBe(true);
    expect(detectHandoff("this is a complaint").needsHuman).toBe(true);
  });
  it("does not flag innocuous messages", () => {
    expect(detectHandoff("Hello I want to book a hotel").needsHuman).toBe(false);
  });
});

describe("intent.classify", () => {
  it("combines category and handoff", () => {
    const r = classify("I have a complaint about my booking");
    expect(r.category).toBe("hotel_booking");
    expect(r.needsHuman).toBe(true);
  });
});
