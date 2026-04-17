import type { CategoryCode } from "../types/domain";

export interface ExtractedFields {
  fullName?: string;
  contactNumber?: string;
  email?: string;
  stayDates?: string;
  numberOfGuests?: number;
  businessType?: string;
  unitType?: string;
  companyName?: string;
  serviceType?: string;
  notes?: string;
}

// Convert Arabic-Indic digits to ASCII
function normalizeDigits(s: string): string {
  return s.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (d) => {
    const code = d.charCodeAt(0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    return String(code - 0x06f0);
  });
}

const PHONE_RE = /(\+?\d[\d\s\-()]{7,}\d)/;
const EMAIL_RE = /([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/;
const GUESTS_RE = /(\d{1,3})\s*(?:guest|guests|ppl|people|person|persons|شخص|أشخاص|اشخاص|ضيف|ضيوف)/i;
const DATES_RE =
  /(\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?(?:\s*(?:to|-|–|الى|إلى)\s*\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?)?)/;

const NAME_CUE_RE =
  /(?:^|\s)(?:my name is|name[:\s]+|i am|i'm|انا|أنا|اسمي|الاسم[:\s]+)\s*([\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,60})/iu;

const COMPANY_CUE_RE =
  /(?:company|organization|company name|شركة|الشركة|مؤسسة|المؤسسة)[:\s]+([\p{L}\p{M}0-9][\p{L}\p{M}0-9\s.&'-]{1,80})/iu;

export function extractFields(rawText: string, category: CategoryCode): ExtractedFields {
  const text = normalizeDigits(rawText ?? "");
  const out: ExtractedFields = {};

  const phone = text.match(PHONE_RE);
  if (phone) out.contactNumber = phone[1].replace(/\s+/g, " ").trim();

  const email = text.match(EMAIL_RE);
  if (email) out.email = email[1];

  const name = text.match(NAME_CUE_RE);
  if (name) out.fullName = name[1].trim().replace(/\s+/g, " ");

  const company = text.match(COMPANY_CUE_RE);
  if (company) out.companyName = company[1].trim().replace(/\s+/g, " ");

  switch (category) {
    case "hotel_booking": {
      const guests = text.match(GUESTS_RE);
      if (guests) out.numberOfGuests = parseInt(guests[1], 10);
      const dates = text.match(DATES_RE);
      if (dates) out.stayDates = dates[1];
      break;
    }
    case "retail_leasing": {
      const bt = text.match(/(?:business type|نوع النشاط|النشاط التجاري)[:\s]+([\p{L}\p{M}0-9][\p{L}\p{M}0-9\s.'-]{1,60})/iu);
      if (bt) out.businessType = bt[1].trim();
      const ut = text.match(/(?:unit type|kiosk|shop|نوع الوحدة|محل|كشك)[:\s]*([\p{L}\p{M}0-9][\p{L}\p{M}0-9\s.'-]{0,40})?/iu);
      if (ut && ut[1]) out.unitType = ut[1].trim();
      break;
    }
    case "vendor": {
      // Require an explicit colon so we don't accidentally match the word "Services"
      // inside a company name like "ABC Services Ltd.".
      const st = text.match(/(?:services?|نوع الخدمة|الخدمة)\s*:\s*([\p{L}\p{M}0-9][\p{L}\p{M}0-9\s.'-]{1,60})/iu);
      if (st) out.serviceType = st[1].trim();
      break;
    }
    case "general_inquiry":
      out.notes = rawText.slice(0, 500);
      break;
  }

  return out;
}
