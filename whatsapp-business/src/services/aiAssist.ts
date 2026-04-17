import axios from "axios";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { query } from "../db/pool";
import type { CategoryCode, Language, Priority } from "../types/domain";

export type SuggestionKind = "reply" | "summary" | "category" | "priority" | "escalation";

export interface SuggestionInput {
  conversationId: number;
  kind: SuggestionKind;
  language?: Language;
}

export interface SuggestionOutput {
  kind: SuggestionKind;
  language: Language;
  content: string;
  meta?: Record<string, unknown>;
  model: string;
}

interface ConversationContext {
  language: Language;
  category: CategoryCode | null;
  priority: Priority;
  tags: string[];
  transcript: Array<{ direction: string; body: string | null; created_at: Date }>;
  lead: Record<string, unknown> | null;
}

async function loadContext(conversationId: number): Promise<ConversationContext | null> {
  const { rows: convRows } = await query<{
    language: Language | null;
    category_code: CategoryCode | null;
    priority: Priority;
    tags: string[];
  }>(
    `SELECT language, category_code, priority, tags
       FROM conversations WHERE id = $1`,
    [conversationId]
  );
  if (convRows.length === 0) return null;
  const c = convRows[0];
  const { rows: msgs } = await query<{ direction: string; body: string | null; created_at: Date }>(
    `SELECT direction, body, created_at
       FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT 20`,
    [conversationId]
  );
  const { rows: leadRows } = await query<Record<string, unknown>>(
    `SELECT * FROM leads WHERE conversation_id = $1`,
    [conversationId]
  );
  return {
    language: c.language ?? "ar",
    category: c.category_code,
    priority: c.priority,
    tags: c.tags ?? [],
    transcript: msgs.reverse(),
    lead: leadRows[0] ?? null
  };
}

function heuristicReply(ctx: ConversationContext): string {
  const name = (ctx.lead?.full_name as string | undefined) ?? null;
  const prefix = ctx.language === "en"
    ? (name ? `Hi ${name}, ` : "Hi, ")
    : (name ? `مرحبًا ${name}، ` : "مرحبًا، ");
  const category = ctx.category ?? "general_inquiry";
  const tailEn: Record<CategoryCode, string> = {
    hotel_booking: "thank you for your booking interest. Could you please confirm your preferred stay dates and the number of guests so we can proceed?",
    retail_leasing: "thank you for your leasing interest. Could you share your business type and preferred unit size so our mall management team can follow up?",
    vendor: "thank you for reaching out. Please register at our vendor portal so our procurement team can review your profile.",
    general_inquiry: "thank you for your message. Could you please share a little more detail so we can direct you to the right team?"
  };
  const tailAr: Record<CategoryCode, string> = {
    hotel_booking: "شكرًا لاهتمامكم بالحجز. نرجو تأكيد تواريخ الإقامة المفضلة وعدد النزلاء.",
    retail_leasing: "شكرًا لاهتمامكم بالتأجير. نرجو مشاركة نوع النشاط والمساحة المفضلة ليتواصل معكم فريق إدارة المول.",
    vendor: "شكرًا لتواصلكم. نرجو التسجيل عبر بوابة الموردين وسيقوم فريق المشتريات بمراجعة الملف.",
    general_inquiry: "شكرًا لرسالتكم. هل يمكنكم تزويدنا بمزيد من التفاصيل لتوجيهكم إلى الفريق المناسب؟"
  };
  return prefix + (ctx.language === "en" ? tailEn[category] : tailAr[category]);
}

function heuristicSummary(ctx: ConversationContext): string {
  const lastInbound = ctx.transcript.filter((m) => m.direction === "inbound").slice(-3);
  const snippets = lastInbound.map((m) => (m.body ?? "").slice(0, 120)).join(" | ");
  const tagLine = ctx.tags.length ? ` [tags: ${ctx.tags.join(", ")}]` : "";
  return (
    `Category: ${ctx.category ?? "unclassified"}. Priority: ${ctx.priority}. ` +
    `Customer said: "${snippets || "—"}"${tagLine}.`
  );
}

function heuristicCategory(ctx: ConversationContext): string {
  // Fall back to current category label; the intent classifier is authoritative on actual detection.
  return ctx.category ?? "general_inquiry";
}

function heuristicPriority(ctx: ConversationContext): Priority {
  const joined = ctx.transcript.map((m) => m.body ?? "").join(" ").toLowerCase();
  if (/(urgent|asap|اليوم|عاجل|now|immediately)/.test(joined)) return "urgent";
  if (ctx.tags.includes("needs_human")) return "high";
  if (ctx.category === "hotel_booking") return "high";
  return "normal";
}

function heuristicEscalation(ctx: ConversationContext): string {
  const joined = ctx.transcript.map((m) => m.body ?? "").join(" ").toLowerCase();
  if (/(complaint|شكوى|refund|استرداد|angry|legal)/.test(joined)) {
    return "ESCALATE: complaint / refund / legal keywords detected; engage manager.";
  }
  if (ctx.tags.includes("needs_human")) {
    return "ESCALATE: customer asked for a human.";
  }
  return "No escalation needed.";
}

async function generateWithAnthropic(
  ctx: ConversationContext,
  kind: SuggestionKind,
  language: Language
): Promise<{ content: string; model: string } | null> {
  if (!env.ANTHROPIC_API_KEY) return null;
  const prompt = buildPrompt(ctx, kind, language);
  try {
    const resp = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: env.ANTHROPIC_MODEL,
        max_tokens: 600,
        system:
          "You are an operator-assist for Jabal Omar Development Company's WhatsApp business " +
          "channel. Always draft replies in the requested language. Never fabricate bookings, " +
          "prices, or commitments. Outputs are suggestions that a human operator must approve " +
          "before sending. Respond concisely and professionally.",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        timeout: 20_000
      }
    );
    const blocks = (resp.data as { content: Array<{ type: string; text?: string }> }).content ?? [];
    const text = blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("\n")
      .trim();
    return text ? { content: text, model: env.ANTHROPIC_MODEL } : null;
  } catch (err) {
    logger.warn({ err: (err as Error).message, kind }, "ai.anthropic.failed");
    return null;
  }
}

function buildPrompt(ctx: ConversationContext, kind: SuggestionKind, language: Language): string {
  const header =
    language === "en"
      ? `Conversation language: English (use Arabic only if the customer clearly prefers it).`
      : `لغة المحادثة: العربية أولًا، مع الرد بالإنجليزية إذا كان العميل يكتب بالإنجليزية.`;
  const transcript = ctx.transcript
    .map((m) => `[${m.direction.toUpperCase()}] ${m.body ?? ""}`)
    .join("\n");
  const baseInfo =
    `Category: ${ctx.category ?? "unclassified"}\nPriority: ${ctx.priority}\nTags: ${ctx.tags.join(", ") || "-"}\n` +
    `Lead fields: ${JSON.stringify(ctx.lead ?? {})}\n\nTranscript:\n${transcript}\n\n`;
  const task: Record<SuggestionKind, string> = {
    reply: language === "en"
      ? "Draft ONE short reply the operator can send verbatim. Be clear, respectful, and fast."
      : "اقترح ردًا واحدًا قصيرًا ومهذبًا يمكن للموظف إرساله كما هو.",
    summary: "Write a 2–3 sentence internal summary for the operator.",
    category: "Suggest the single best category code among: hotel_booking, retail_leasing, vendor, general_inquiry. Respond with just the code.",
    priority: "Suggest a single priority among: low, normal, high, urgent. Respond with just the word.",
    escalation: "Decide if this should be escalated to a manager. Answer with 'ESCALATE: <reason>' or 'No escalation needed.'"
  };
  return `${header}\n\n${baseInfo}Task: ${task[kind]}`;
}

export async function suggest(
  input: SuggestionInput & { requestedByUserId: number | null }
): Promise<SuggestionOutput | null> {
  if (!env.AI_ASSIST_ENABLED) return null;
  const ctx = await loadContext(input.conversationId);
  if (!ctx) return null;
  const language = input.language ?? ctx.language;

  let content: string | null = null;
  let model = "heuristic-local";
  const online = await generateWithAnthropic(ctx, input.kind, language);
  if (online) {
    content = online.content;
    model = online.model;
  } else {
    switch (input.kind) {
      case "reply":      content = heuristicReply(ctx); break;
      case "summary":    content = heuristicSummary(ctx); break;
      case "category":   content = heuristicCategory(ctx); break;
      case "priority":   content = heuristicPriority(ctx); break;
      case "escalation": content = heuristicEscalation(ctx); break;
    }
  }
  if (content == null) return null;

  // Persist for audit; the frontend never auto-sends, operator must click Send.
  await query(
    `INSERT INTO ai_suggestions (conversation_id, kind, language, content, model, requested_by, meta)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [
      input.conversationId,
      input.kind,
      language,
      content,
      model,
      input.requestedByUserId,
      JSON.stringify({ category: ctx.category, priority: ctx.priority })
    ]
  );
  return { kind: input.kind, language, content, model };
}
