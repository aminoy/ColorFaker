import { query } from "../db/pool";
import type { CategoryCode, Language } from "../types/domain";

export interface CannedReply {
  id: number;
  code: string;
  language: Language;
  title: string;
  body: string;
  category_code: CategoryCode | null;
  is_active: boolean;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export async function listCannedReplies(filter: {
  language?: Language;
  category?: CategoryCode;
  onlyActive?: boolean;
}): Promise<CannedReply[]> {
  const params: unknown[] = [];
  const where: string[] = [];
  if (filter.language) {
    params.push(filter.language);
    where.push(`language = $${params.length}`);
  }
  if (filter.category) {
    params.push(filter.category);
    where.push(`(category_code = $${params.length} OR category_code IS NULL)`);
  }
  if (filter.onlyActive) where.push(`is_active = TRUE`);
  const { rows } = await query<CannedReply>(
    `SELECT * FROM canned_replies
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY code, language`,
    params
  );
  return rows;
}

export async function upsertCannedReply(input: {
  id?: number;
  code: string;
  language: Language;
  title: string;
  body: string;
  category_code?: CategoryCode | null;
  is_active?: boolean;
  createdBy: number | null;
}): Promise<CannedReply> {
  if (input.id) {
    const { rows } = await query<CannedReply>(
      `UPDATE canned_replies
          SET code = $2, language = $3, title = $4, body = $5,
              category_code = $6, is_active = COALESCE($7, is_active),
              updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [
        input.id,
        input.code,
        input.language,
        input.title,
        input.body,
        input.category_code ?? null,
        input.is_active
      ]
    );
    return rows[0];
  }
  const { rows } = await query<CannedReply>(
    `INSERT INTO canned_replies (code, language, title, body, category_code, is_active, created_by)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,TRUE),$7)
     ON CONFLICT (code, language) DO UPDATE SET
       title = EXCLUDED.title,
       body = EXCLUDED.body,
       category_code = EXCLUDED.category_code,
       is_active = EXCLUDED.is_active,
       updated_at = NOW()
     RETURNING *`,
    [
      input.code,
      input.language,
      input.title,
      input.body,
      input.category_code ?? null,
      input.is_active,
      input.createdBy
    ]
  );
  return rows[0];
}

export async function deleteCannedReply(id: number): Promise<void> {
  await query(`DELETE FROM canned_replies WHERE id = $1`, [id]);
}
