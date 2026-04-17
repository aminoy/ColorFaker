import { Router } from "express";
import { query } from "../db/pool";
import type { CategoryCode } from "../types/domain";

/**
 * Minimal admin/reporting read-only endpoints. In production these must be
 * protected by an auth layer (API key, OAuth, IP allowlist). Left unauthenticated
 * here so you can wire your preferred gateway (nginx + basic auth, Cloudflare
 * Access, etc.). See README.md.
 */
export const adminRouter = Router();

adminRouter.get("/leads", async (req, res) => {
  const category = (req.query.category as string | undefined) as CategoryCode | undefined;
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  const params: unknown[] = [];
  const where: string[] = [];
  if (category) {
    params.push(category);
    where.push(`category_code = $${params.length}`);
  }
  params.push(limit);
  const sql = `
    SELECT l.*, c.wa_id, c.display_name
      FROM leads l
      JOIN contacts c ON c.id = l.contact_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY l.created_at DESC
     LIMIT $${params.length}
  `;
  const { rows } = await query(sql, params);
  res.json({ count: rows.length, leads: rows });
});

adminRouter.get("/conversations", async (req, res) => {
  const needsHuman = req.query.needs_human === "true";
  const params: unknown[] = [];
  const where: string[] = [];
  if (needsHuman) where.push("needs_human = TRUE");
  const limit = Math.min(Number(req.query.limit ?? 100), 500);
  params.push(limit);
  const sql = `
    SELECT c.*, ct.wa_id, ct.display_name
      FROM conversations c
      JOIN contacts ct ON ct.id = c.contact_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY c.last_message_at DESC
      LIMIT $${params.length}
  `;
  const { rows } = await query(sql, params);
  res.json({ count: rows.length, conversations: rows });
});

adminRouter.post("/conversations/:id/note", async (req, res) => {
  const id = Number(req.params.id);
  const note = (req.body?.note ?? "").toString();
  if (!id || !note) {
    res.status(400).json({ error: "id and note required" });
    return;
  }
  await query(
    `UPDATE conversations
        SET internal_notes = COALESCE(internal_notes, '') || $2
      WHERE id = $1`,
    [id, `\n[${new Date().toISOString()}] ${note}`]
  );
  res.json({ ok: true });
});
