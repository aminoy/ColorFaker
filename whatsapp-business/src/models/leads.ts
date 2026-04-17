import { query } from "../db/pool";
import type { CategoryCode } from "../types/domain";

export interface LeadInput {
  conversationId: number;
  contactId: number;
  categoryCode: CategoryCode;
  fullName?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  stayDates?: string | null;
  numberOfGuests?: number | null;
  businessType?: string | null;
  unitType?: string | null;
  companyName?: string | null;
  serviceType?: string | null;
  notes?: string | null;
  rawFields?: Record<string, unknown>;
}

export async function upsertLead(input: LeadInput): Promise<number> {
  const existing = await query<{ id: number }>(
    `SELECT id FROM leads WHERE conversation_id = $1`,
    [input.conversationId]
  );
  if (existing.rowCount > 0) {
    const id = existing.rows[0].id;
    await query(
      `UPDATE leads SET
        full_name        = COALESCE($2, full_name),
        contact_number   = COALESCE($3, contact_number),
        email            = COALESCE($4, email),
        stay_dates       = COALESCE($5, stay_dates),
        number_of_guests = COALESCE($6, number_of_guests),
        business_type    = COALESCE($7, business_type),
        unit_type        = COALESCE($8, unit_type),
        company_name     = COALESCE($9, company_name),
        service_type     = COALESCE($10, service_type),
        notes            = COALESCE($11, notes),
        raw_fields       = raw_fields || $12::jsonb,
        updated_at       = NOW()
       WHERE id = $1`,
      [
        id,
        input.fullName ?? null,
        input.contactNumber ?? null,
        input.email ?? null,
        input.stayDates ?? null,
        input.numberOfGuests ?? null,
        input.businessType ?? null,
        input.unitType ?? null,
        input.companyName ?? null,
        input.serviceType ?? null,
        input.notes ?? null,
        JSON.stringify(input.rawFields ?? {})
      ]
    );
    return id;
  }
  const { rows } = await query<{ id: number }>(
    `INSERT INTO leads
      (conversation_id, contact_id, category_code, full_name, contact_number, email,
       stay_dates, number_of_guests, business_type, unit_type,
       company_name, service_type, notes, raw_fields)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb)
     RETURNING id`,
    [
      input.conversationId,
      input.contactId,
      input.categoryCode,
      input.fullName ?? null,
      input.contactNumber ?? null,
      input.email ?? null,
      input.stayDates ?? null,
      input.numberOfGuests ?? null,
      input.businessType ?? null,
      input.unitType ?? null,
      input.companyName ?? null,
      input.serviceType ?? null,
      input.notes ?? null,
      JSON.stringify(input.rawFields ?? {})
    ]
  );
  return rows[0].id;
}
