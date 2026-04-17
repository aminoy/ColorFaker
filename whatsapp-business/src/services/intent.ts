import type { CategoryCode } from "../types/domain";

export interface IntentResult {
  category: CategoryCode | null;
  needsHuman: boolean;
  handoffReason?: string;
}

const HANDOFF_KEYWORDS_AR = [
  "شكوى",
  "شكوي",
  "مشكلة",
  "مشكله",
  "موظف",
  "ممثل",
  "خدمة العملاء",
  "أتحدث مع شخص",
  "اتحدث مع شخص",
  "شخص حقيقي"
];

const HANDOFF_KEYWORDS_EN = [
  "complaint",
  "complain",
  "problem",
  "issue",
  "human",
  "agent",
  "representative",
  "speak to a person",
  "talk to someone",
  "real person",
  "support"
];

const CATEGORY_KEYWORDS: Record<CategoryCode, string[]> = {
  hotel_booking: [
    "حجز", "حجوزات", "فندق", "فندقي", "إقامة", "اقامة", "غرفة", "غرف",
    "book", "booking", "reservation", "hotel", "stay", "room", "check-in", "check in"
  ],
  retail_leasing: [
    "تأجير", "تاجير", "إيجار", "ايجار", "محل", "محلات", "كشك", "أكشاك", "اكشاك",
    "وحدة تجارية", "مول", "مركز تجاري",
    "lease", "leasing", "rent", "rental", "shop", "store", "retail", "kiosk", "unit", "mall"
  ],
  vendor: [
    "مورد", "موردين", "خدمة", "خدمات", "مقاول", "توريد", "شركة توريد", "تسجيل مورد",
    "vendor", "supplier", "service provider", "contractor", "procurement"
  ],
  general_inquiry: [
    "استفسار", "سؤال", "معلومات", "ساعات العمل", "التواصل",
    "inquiry", "question", "info", "information", "general", "contact", "hours"
  ]
};

const NUMERIC_MAP: Record<string, CategoryCode> = {
  "1": "hotel_booking",
  "٢": "retail_leasing",
  "2": "retail_leasing",
  "3": "vendor",
  "4": "general_inquiry",
  "١": "hotel_booking",
  "٣": "vendor",
  "٤": "general_inquiry"
};

function normalize(text: string): string {
  return text
    .replace(/[\u064B-\u0652]/g, "") // Arabic diacritics
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

export function detectCategory(text: string): CategoryCode | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (NUMERIC_MAP[trimmed]) return NUMERIC_MAP[trimmed];
  // Menu responses like "option 1" / "الخيار 1"
  const numMatch = trimmed.match(/(?:^|\s)([1-4])(?:[).\s]|$)/);
  if (numMatch && NUMERIC_MAP[numMatch[1]]) return NUMERIC_MAP[numMatch[1]];

  const normalized = normalize(trimmed);
  let best: { code: CategoryCode; score: number } | null = null;
  for (const [code, keywords] of Object.entries(CATEGORY_KEYWORDS) as [
    CategoryCode,
    string[]
  ][]) {
    let score = 0;
    for (const kw of keywords) {
      if (normalized.includes(normalize(kw))) score += kw.length >= 6 ? 2 : 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { code, score };
    }
  }
  return best?.code ?? null;
}

export function detectHandoff(text: string): { needsHuman: boolean; reason?: string } {
  const normalized = normalize(text);
  for (const kw of HANDOFF_KEYWORDS_AR) {
    if (normalized.includes(normalize(kw))) return { needsHuman: true, reason: `ar_keyword:${kw}` };
  }
  for (const kw of HANDOFF_KEYWORDS_EN) {
    if (normalized.includes(normalize(kw))) return { needsHuman: true, reason: `en_keyword:${kw}` };
  }
  return { needsHuman: false };
}

export function classify(text: string): IntentResult {
  const handoff = detectHandoff(text);
  return {
    category: detectCategory(text),
    needsHuman: handoff.needsHuman,
    handoffReason: handoff.reason
  };
}
