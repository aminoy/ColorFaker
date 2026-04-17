import crypto from "crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import express from "express";
import { z } from "zod";
import { env } from "../config/env";
import { requireAuth } from "../middleware/auth";
import {
  findUserByEmail,
  issueToken,
  recordLoginSuccess,
  verifyPassword
} from "../services/auth";
import { fromRequest, recordAudit } from "../services/audit";

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
