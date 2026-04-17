import { Router } from "express";
import { query } from "../db/pool";

export const healthRouter = Router();

healthRouter.get("/healthz", async (_req, res) => {
  res.json({ ok: true, service: "jabal-omar-whatsapp", ts: new Date().toISOString() });
});

healthRouter.get("/readyz", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(503).json({ ok: false, error: (err as Error).message });
  }
});
