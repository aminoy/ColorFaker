import type { Language } from "../types/domain";

// Arabic Unicode block ranges (incl. supplement & extended).
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const LATIN_RE = /[A-Za-z]/;

export function detectLanguage(text: string): Language | null {
  if (!text) return null;
  const arabic = ARABIC_RE.test(text);
  const latin = LATIN_RE.test(text);
  if (arabic && !latin) return "ar";
  if (latin && !arabic) return "en";
  if (arabic) return "ar"; // mixed: prefer Arabic (primary audience)
  return null;
}
