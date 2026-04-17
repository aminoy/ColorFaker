import express, { Router } from "express";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { requireAuth, requireRole, csrfGuard } from "../middleware/auth";
import { fromRequest, recordAudit } from "../services/audit";
import { query } from "../db/pool";
import {
  clearUnread,
  getConversationById,
  setOperationalStatus,
  setPriority
} from "../models/conversations";
import { applyDeadlines, listSlaRisks, loadRules } from "../services/sla";
import { assignConversation, listAssignments } from "../models/assignments";
import { createNote, listNotes } from "../models/notes";
import {
  cancelFollowUp,
  completeFollowUp,
  createFollowUp,
  listFollowUps
} from "../models/followUps";
import { getConversationTimeline, searchInbox } from "../models/inbox";
import { enqueueText } from "../services/outboundQueue";
import { listQueue } from "../models/outboundQueue";
import {
  backlog,
  byCategory,
  defaultRange,
  leadAnalytics,
  overview,
  teamPerformance,
  toCsvRows
} from "../reporting/dashboard";
import { suggest } from "../services/aiAssist";
import { getServiceWindowStatus } from "../services/serviceWindow";
import { retryFailedSyncs } from "../services/crm/crmDispatcher";

export const apiRouter = Router();

apiRouter.use(express.json({ limit: "256kb" }));
apiRouter.use(cookieParser());
apiRouter.use(requireAuth);
apiRouter.use(csrfGuard);

// --- Users / teams ------------------------------------------------
apiRouter.get("/users", async (_req, res) => {
  const { rows } = await query(
    `SELECT id, email, display_name, role, team_id, is_active, last_login_at
       FROM users ORDER BY display_name`
  );
  res.json({ users: rows });
});

apiRouter.post("/users", requireRole("admin"), async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    display_name: z.string().min(1),
    password: z.string().min(8),
    role: z.enum(["admin", "manager", "agent", "viewer"]),
    team_id: z.number().int().positive().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", details: parsed.error.flatten() });
    return;
  }
  const bcrypt = await import("bcryptjs");
  const hash = bcrypt.hashSync(parsed.data.password, 10);
  const { rows } = await query<{ id: number }>(
    `INSERT INTO users (email, display_name, password_hash, role, team_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [
      parsed.data.email,
      parsed.data.display_name,
      hash,
      parsed.data.role,
      parsed.data.team_id ?? null
    ]
  );
  await recordAudit(
    fromRequest(req, "user_created", {
      entityType: "user",
      entityId: rows[0].id,
      metadata: { email: parsed.data.email, role: parsed.data.role }
    })
  );
  res.status(201).json({ id: rows[0].id });
});

apiRouter.get("/teams", async (_req, res) => {
  const { rows } = await query(`SELECT id, name, description FROM teams ORDER BY name`);
  res.json({ teams: rows });
});

// --- Inbox --------------------------------------------------------
apiRouter.get("/inbox", async (req, res) => {
  const filter = {
    category: req.query.category as string | undefined,
    status: req.query.status as string | undefined,
    assigneeId:
      req.query.assignee_id === "unassigned"
        ? -1
        : req.query.assignee_id !== undefined
          ? Number(req.query.assignee_id)
          : undefined,
    teamId: req.query.team_id !== undefined ? Number(req.query.team_id) : undefined,
    priority: req.query.priority as string | undefined,
    needsHuman: req.query.needs_human === "true",
    unread: req.query.unread === "true",
    startDate: req.query.start_date ? new Date(String(req.query.start_date)) : undefined,
    endDate: req.query.end_date ? new Date(String(req.query.end_date)) : undefined,
    search: (req.query.search as string | undefined)?.trim() || undefined,
    limit: req.query.limit ? Number(req.query.limit) : 50,
    offset: req.query.offset ? Number(req.query.offset) : 0
  };
  const result = await searchInbox(filter);
  res.json({ count: result.rows.length, total: result.total, conversations: result.rows });
});

apiRouter.get("/conversations/:id", async (req, res) => {
  const id = Number(req.params.id);
  const timeline = await getConversationTimeline(id);
  if (!timeline) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const assignments = await listAssignments(id);
  const notes = await listNotes(id);
  const followUps = await listFollowUps({ conversationId: id });
  const window = getServiceWindowStatus(timeline.conversation.last_customer_message_at);
  res.json({ ...timeline, assignments, notes, followUps, service_window: window });
});

apiRouter.post("/conversations/:id/read", async (req, res) => {
  const id = Number(req.params.id);
  await clearUnread(id);
  res.json({ ok: true });
});

apiRouter.post(
  "/conversations/:id/reply",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({ body: z.string().min(1).max(4096) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const conv = await getConversationById(id);
    if (!conv) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    const { rows: contactRows } = await query<{ wa_id: string }>(
      `SELECT wa_id FROM contacts WHERE id = $1`,
      [conv.contact_id]
    );
    if (contactRows.length === 0) {
      res.status(404).json({ error: "contact_missing" });
      return;
    }
    const queued = await enqueueText({
      conversationId: id,
      contactWaId: contactRows[0].wa_id,
      body: parsed.data.body,
      requestedByUserId: req.user!.id
    });
    // Auto-transition to in_progress if it was pending.
    if (conv.status === "pending_human" || conv.status === "new" || conv.status === "bot_handled") {
      await setOperationalStatus(id, "in_progress");
    }
    await recordAudit(
      fromRequest(req, "reply_sent", {
        entityType: "conversation",
        entityId: id,
        metadata: {
          queue_id: queued.id,
          status: queued.status,
          body_preview: parsed.data.body.slice(0, 120)
        }
      })
    );
    res.status(202).json({ queued });
  }
);

apiRouter.post(
  "/conversations/:id/status",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({
      status: z.enum([
        "new",
        "bot_handled",
        "pending_human",
        "in_progress",
        "waiting_on_customer",
        "resolved",
        "archived"
      ])
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const conv = await setOperationalStatus(id, parsed.data.status);
    await recordAudit(
      fromRequest(req, "status_changed", {
        entityType: "conversation",
        entityId: id,
        metadata: { to: parsed.data.status }
      })
    );
    res.json({ conversation: conv });
  }
);

apiRouter.post(
  "/conversations/:id/priority",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({
      priority: z.enum(["low", "normal", "high", "urgent"])
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    await setPriority(id, parsed.data.priority);
    await applyDeadlines(id);
    await recordAudit(
      fromRequest(req, "priority_changed", {
        entityType: "conversation",
        entityId: id,
        metadata: { to: parsed.data.priority }
      })
    );
    res.json({ ok: true });
  }
);

apiRouter.post(
  "/conversations/:id/tags",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({ tags: z.array(z.string()).max(20) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    await query(`UPDATE conversations SET tags = $2 WHERE id = $1`, [id, parsed.data.tags]);
    res.json({ ok: true });
  }
);

apiRouter.post(
  "/conversations/:id/assign",
  requireRole("admin", "manager"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({
      assignee_id: z.number().int().nullable(),
      team_id: z.number().int().nullable().optional(),
      reason: z.string().max(200).optional()
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const assignment = await assignConversation(
      id,
      parsed.data.assignee_id,
      parsed.data.team_id ?? null,
      req.user!.id,
      parsed.data.reason
    );
    await recordAudit(
      fromRequest(req, "assignment_changed", {
        entityType: "conversation",
        entityId: id,
        metadata: {
          assignee_id: parsed.data.assignee_id,
          team_id: parsed.data.team_id ?? null
        }
      })
    );
    res.json({ assignment });
  }
);

// --- Notes --------------------------------------------------------
apiRouter.post(
  "/conversations/:id/notes",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({ body: z.string().min(1).max(4000) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const note = await createNote(id, req.user!.id, parsed.data.body);
    await recordAudit(
      fromRequest(req, "note_created", {
        entityType: "conversation",
        entityId: id,
        metadata: { note_id: note.id }
      })
    );
    res.status(201).json({ note });
  }
);

// --- Follow-ups ---------------------------------------------------
apiRouter.post(
  "/conversations/:id/follow-ups",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({
      owner_user_id: z.number().int().nullable(),
      due_at: z.string(),
      note: z.string().max(500).optional()
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const f = await createFollowUp({
      conversationId: id,
      ownerUserId: parsed.data.owner_user_id,
      dueAt: new Date(parsed.data.due_at),
      note: parsed.data.note,
      createdBy: req.user!.id
    });
    await recordAudit(
      fromRequest(req, "follow_up_created", {
        entityType: "conversation",
        entityId: id,
        metadata: { follow_up_id: f.id, due_at: parsed.data.due_at }
      })
    );
    res.status(201).json({ followUp: f });
  }
);

apiRouter.get("/follow-ups", async (req, res) => {
  const owner = req.query.owner === "me" ? req.user!.id : undefined;
  const rows = await listFollowUps({
    ownerUserId: owner,
    overdueOnly: req.query.overdue === "true",
    status: req.query.status as "pending" | "done" | "cancelled" | undefined,
    limit: req.query.limit ? Number(req.query.limit) : 200
  });
  res.json({ followUps: rows });
});

apiRouter.post(
  "/follow-ups/:id/complete",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    await completeFollowUp(Number(req.params.id));
    res.json({ ok: true });
  }
);

apiRouter.post(
  "/follow-ups/:id/cancel",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    await cancelFollowUp(Number(req.params.id));
    res.json({ ok: true });
  }
);

// --- SLA ----------------------------------------------------------
apiRouter.get("/sla/rules", async (_req, res) => {
  res.json({ rules: await loadRules() });
});

apiRouter.get("/sla/risks", async (_req, res) => {
  res.json({ risks: await listSlaRisks() });
});

// --- Dashboard ----------------------------------------------------
function parseRange(req: express.Request) {
  const def = defaultRange();
  return {
    start: req.query.start ? new Date(String(req.query.start)) : def.start,
    end: req.query.end ? new Date(String(req.query.end)) : def.end
  };
}

apiRouter.get("/dashboard/overview", async (req, res) => {
  res.json(await overview(parseRange(req)));
});
apiRouter.get("/dashboard/categories", async (req, res) => {
  res.json({ rows: await byCategory(parseRange(req)) });
});
apiRouter.get("/dashboard/team", async (req, res) => {
  res.json({ rows: await teamPerformance(parseRange(req)) });
});
apiRouter.get("/dashboard/leads", async (req, res) => {
  res.json({ rows: await leadAnalytics(parseRange(req)) });
});
apiRouter.get("/dashboard/backlog", async (_req, res) => {
  res.json(await backlog());
});

apiRouter.get("/export/leads.csv", async (req, res) => {
  const range = parseRange(req);
  const { rows } = await query(
    `SELECT l.id, l.created_at, l.category_code, l.full_name, l.contact_number,
            l.email, l.stay_dates, l.number_of_guests, l.business_type, l.unit_type,
            l.company_name, l.service_type, l.notes, c.wa_id
       FROM leads l
       JOIN contacts c ON c.id = l.contact_id
      WHERE l.created_at >= $1 AND l.created_at < $2
      ORDER BY l.created_at DESC`,
    [range.start.toISOString(), range.end.toISOString()]
  );
  const header = [
    "id","created_at","category_code","full_name","contact_number","email",
    "stay_dates","number_of_guests","business_type","unit_type",
    "company_name","service_type","notes","wa_id"
  ];
  res.setHeader("content-type", "text/csv");
  res.setHeader(
    "content-disposition",
    `attachment; filename="leads-${range.start.toISOString().slice(0,10)}_${range.end.toISOString().slice(0,10)}.csv"`
  );
  res.send(toCsvRows(header, rows as Record<string, unknown>[]));
});

apiRouter.get("/export/conversations.csv", async (req, res) => {
  const range = parseRange(req);
  const { rows } = await query(
    `SELECT c.id, c.started_at, c.status, c.priority, c.category_code, c.needs_human,
            c.first_response_at, c.resolved_at, ct.wa_id, ct.display_name,
            u.email AS assignee_email
       FROM conversations c
       JOIN contacts ct ON ct.id = c.contact_id
       LEFT JOIN users u ON u.id = c.assignee_id
      WHERE c.started_at >= $1 AND c.started_at < $2
      ORDER BY c.started_at DESC`,
    [range.start.toISOString(), range.end.toISOString()]
  );
  const header = [
    "id","started_at","status","priority","category_code","needs_human",
    "first_response_at","resolved_at","wa_id","display_name","assignee_email"
  ];
  res.setHeader("content-type", "text/csv");
  res.setHeader(
    "content-disposition",
    `attachment; filename="conversations-${range.start.toISOString().slice(0,10)}_${range.end.toISOString().slice(0,10)}.csv"`
  );
  res.send(toCsvRows(header, rows as Record<string, unknown>[]));
});

// --- Queue + CRM admin -------------------------------------------
apiRouter.get("/outbound", requireRole("admin", "manager"), async (req, res) => {
  const status = req.query.status as
    | "queued" | "sent" | "failed" | "abandoned" | "waiting_24h" | undefined;
  res.json({ queue: await listQueue(status, 100) });
});

apiRouter.post(
  "/crm/retry",
  requireRole("admin", "manager"),
  async (_req, res) => {
    const n = await retryFailedSyncs();
    res.json({ retried: n });
  }
);

apiRouter.get("/crm/logs", requireRole("admin", "manager"), async (_req, res) => {
  const { rows } = await query(
    `SELECT * FROM crm_sync_logs ORDER BY created_at DESC LIMIT 200`
  );
  res.json({ logs: rows });
});

// --- Audit --------------------------------------------------------
apiRouter.get("/audit", requireRole("admin", "manager"), async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 200), 1000);
  const { rows } = await query(
    `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  res.json({ logs: rows });
});

// --- AI assist ----------------------------------------------------
apiRouter.post(
  "/conversations/:id/ai-suggest",
  requireRole("admin", "manager", "agent"),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z.object({
      kind: z.enum(["reply", "summary", "category", "priority", "escalation"]),
      language: z.enum(["ar", "en"]).optional()
    }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const out = await suggest({
      conversationId: id,
      kind: parsed.data.kind,
      language: parsed.data.language,
      requestedByUserId: req.user!.id
    });
    if (!out) {
      res.status(404).json({ error: "no_suggestion" });
      return;
    }
    await recordAudit(
      fromRequest(req, "ai_suggestion_viewed", {
        entityType: "conversation",
        entityId: id,
        metadata: { kind: parsed.data.kind, model: out.model }
      })
    );
    res.json(out);
  }
);
