import { extractFields } from "../../src/services/leadExtraction";

describe("leadExtraction.extractFields", () => {
  it("extracts phone and email", () => {
    const f = extractFields(
      "My name is Ahmed, call me on +966 50 123 4567, email ahmed@example.com",
      "hotel_booking"
    );
    expect(f.fullName).toMatch(/Ahmed/);
    expect(f.contactNumber).toMatch(/\+966/);
    expect(f.email).toBe("ahmed@example.com");
  });

  it("extracts hotel booking specifics", () => {
    const f = extractFields(
      "I'd like to book from 12/05/2025 to 14/05/2025 for 3 guests",
      "hotel_booking"
    );
    expect(f.stayDates).toContain("12/05/2025");
    expect(f.numberOfGuests).toBe(3);
  });

  it("extracts Arabic-Indic guest count", () => {
    const f = extractFields("نرغب بالحجز لـ ٤ ضيوف", "hotel_booking");
    expect(f.numberOfGuests).toBe(4);
  });

  it("extracts retail leasing business type", () => {
    const f = extractFields(
      "business type: coffee shop, interested in kiosk",
      "retail_leasing"
    );
    expect(f.businessType?.toLowerCase()).toContain("coffee");
  });

  it("extracts vendor company and service", () => {
    const f = extractFields(
      "Company: ABC Services Ltd. Services: HVAC maintenance",
      "vendor"
    );
    expect(f.companyName).toMatch(/ABC/);
    expect(f.serviceType?.toLowerCase()).toContain("hvac");
  });
});
