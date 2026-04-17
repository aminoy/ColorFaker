import { query } from "../db/pool";
import type { Contact, Language } from "../types/domain";

export async function upsertContact(
  waId: string,
  displayName?: string | null,
  locale?: Language | null
): Promise<{ contact: Contact; isNew: boolean }> {
  const existing = await query<Contact>("SELECT * FROM contacts WHERE wa_id = $1", [waId]);
  if (existing.rowCount > 0) {
    const row = existing.rows[0];
    await query(
      `UPDATE contacts
         SET display_name = COALESCE($1, display_name),
             locale = COALESCE($2, locale),
             last_seen_at = NOW()
       WHERE id = $3`,
      [displayName ?? null, locale ?? null, row.id]
    );
    return { contact: { ...row, last_seen_at: new Date() }, isNew: false };
  }
  const inserted = await query<Contact>(
    `INSERT INTO contacts (wa_id, display_name, locale)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [waId, displayName ?? null, locale ?? null]
  );
  return { contact: inserted.rows[0], isNew: true };
}

export async function setLocale(contactId: number, locale: Language): Promise<void> {
  await query("UPDATE contacts SET locale = $1 WHERE id = $2", [locale, contactId]);
}
