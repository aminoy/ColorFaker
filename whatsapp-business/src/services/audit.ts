import type { Request } from "express";
import { query } from "../db/pool";
import { logger } from "../config/logger";
import type { AuthUser } from "./auth";

export interface AuditEntry {
  actor?: Pick<AuthUser, "id" | "email"> | null;
  event: string;
  entityType?: string;
  entityId?: number | null;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs
          (actor_user_id, actor_email, event, entity_type, entity_id, metadata, ip, user_agent)
        VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)`,
      [
        entry.actor?.id ?? null,
        entry.actor?.email ?? null,
        entry.event,
        entry.entityType ?? null,
        entry.entityId ?? null,
        JSON.stringify(entry.metadata ?? {}),
        entry.ip ?? null,
        entry.userAgent ?? null
      ]
    );
    logger.info(
      {
        event: entry.event,
        entity: entry.entityType,
        entityId: entry.entityId,
        actor: entry.actor?.email
      },
      "audit"
    );
  } catch (err) {
    // Audit failures must not break the request.
    logger.error({ err, entry }, "audit.write_failed");
  }
}

export function fromRequest(
  req: Request,
  event: string,
  opts: Omit<AuditEntry, "event" | "ip" | "userAgent" | "actor"> = {}
): AuditEntry {
  const actor = (req as Request & { user?: AuthUser }).user;
  return {
    ...opts,
    event,
    actor: actor ? { id: actor.id, email: actor.email } : null,
    ip: (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() || req.ip,
    userAgent: req.headers["user-agent"]
  };
}
