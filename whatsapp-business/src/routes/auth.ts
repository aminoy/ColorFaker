import crypto from "crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import express from "express";
import { z } from "zod";
import { env } from "../config/env";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  findUserByEmail,
  findUserById,
  hashPassword,
  issueToken,
  recordLoginSuccess,
  verifyPassword
} from "../services/auth";
import { fromRequest, recordAudit } from "../services/audit";
import { query } from "../db/pool";

export const authRouter = Router();

const limiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post(
  "/login",
  limiter,
  express.json({ limit: "8kb" }),
  async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      await recordAudit(
        fromRequest(req, "login_failed", { metadata: { email } })
      );
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }

    const token = issueToken(user);
    const csrf = crypto.randomBytes(24).toString("hex");

    res.cookie(env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.AUTH_COOKIE_SECURE,
      maxAge: env.JWT_TTL_SECONDS * 1000,
      path: "/"
    });
    res.cookie("jo_csrf", csrf, {
      httpOnly: false,
      sameSite: "lax",
      secure: env.AUTH_COOKIE_SECURE,
      maxAge: env.JWT_TTL_SECONDS * 1000,
      path: "/"
    });

    await recordLoginSuccess(user.id);
    await recordAudit(
      fromRequest(req, "login", {
        entityType: "user",
        entityId: user.id,
        metadata: { role: user.role }
      })
    );
    res.json({
      token,
      csrf,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        team_id: user.team_id
      }
    });
  }
);

authRouter.post("/logout", requireAuth, async (req, res) => {
  res.clearCookie(env.AUTH_COOKIE_NAME, { path: "/" });
  res.clearCookie("jo_csrf", { path: "/" });
  await recordAudit(fromRequest(req, "logout"));
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const u = req.user!;
  res.json({
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    role: u.role,
    team_id: u.team_id
  });
});

// --- Self-service password change --------------------------------
authRouter.post(
  "/password",
  requireAuth,
  express.json({ limit: "8kb" }),
  async (req, res) => {
    const parsed = z
      .object({
        current_password: z.string().min(1),
        new_password: z.string().min(8).max(128)
      })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const me = req.user!;
    const full = await findUserByEmail(me.email);
    if (!full || !verifyPassword(parsed.data.current_password, full.password_hash)) {
      await recordAudit(
        fromRequest(req, "password_change_failed", {
          entityType: "user",
          entityId: me.id
        })
      );
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }
    await query(
      `UPDATE users SET password_hash = $2, password_changed_at = NOW() WHERE id = $1`,
      [me.id, hashPassword(parsed.data.new_password)]
    );
    await recordAudit(
      fromRequest(req, "password_changed", { entityType: "user", entityId: me.id })
    );
    res.json({ ok: true });
  }
);

// --- Admin force-reset of another user's password ----------------
authRouter.post(
  "/users/:id/reset-password",
  requireAuth,
  requireRole("admin"),
  express.json({ limit: "8kb" }),
  async (req, res) => {
    const id = Number(req.params.id);
    const parsed = z
      .object({ new_password: z.string().min(8).max(128) })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }
    const target = await findUserById(id);
    if (!target) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    await query(
      `UPDATE users SET password_hash = $2, password_changed_at = NOW() WHERE id = $1`,
      [id, hashPassword(parsed.data.new_password)]
    );
    await recordAudit(
      fromRequest(req, "password_reset", {
        entityType: "user",
        entityId: id,
        metadata: { target_email: target.email }
      })
    );
    res.json({ ok: true });
  }
);
