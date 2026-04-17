import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { findUserById, verifyToken, type AuthUser, type Role } from "../services/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

/**
 * Extract the auth token from either the Authorization header ("Bearer ...")
 * or from the signed-session cookie (set on successful login).
 */
export function extractToken(req: Request): string | null {
  const header = req.header("authorization") ?? req.header("Authorization");
  if (header && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim() || null;
  }
  const cookie = (req.cookies ?? {})[env.AUTH_COOKIE_NAME];
  return cookie || null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "invalid_token" });
    return;
  }
  const user = await findUserById(payload.sub);
  if (!user || !user.is_active) {
    res.status(401).json({ error: "user_disabled" });
    return;
  }
  req.user = user;
  next();
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    if (!allowed.includes(user.role)) {
      res.status(403).json({ error: "forbidden", required: allowed });
      return;
    }
    next();
  };
}

/**
 * Enforces a simple CSRF defense: on state-changing requests when the session
 * is cookie-based, require a matching `X-CSRF-Token` header (double-submit).
 * If auth comes from a Bearer header there's no CSRF risk, so we skip.
 */
export function csrfGuard(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  const isUnsafe = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  if (!isUnsafe) return next();
  const usingCookie = Boolean((req.cookies ?? {})[env.AUTH_COOKIE_NAME]);
  const usingBearer = (req.header("authorization") ?? "").toLowerCase().startsWith("bearer ");
  if (!usingCookie || usingBearer) return next();
  const headerToken = req.header("x-csrf-token");
  const cookieToken = (req.cookies ?? {})["jo_csrf"];
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    res.status(403).json({ error: "csrf_failed" });
    return;
  }
  next();
}
