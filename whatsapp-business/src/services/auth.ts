import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { query } from "../db/pool";

export type Role = "admin" | "manager" | "agent" | "viewer";

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  team_id: number | null;
  is_active: boolean;
}

export interface TokenPayload {
  sub: number;
  email: string;
  role: Role;
}

export async function findUserByEmail(email: string): Promise<(AuthUser & { password_hash: string }) | null> {
  const { rows } = await query<AuthUser & { password_hash: string }>(
    `SELECT id, email, display_name, password_hash, role, team_id, is_active
       FROM users WHERE lower(email) = lower($1) LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<AuthUser | null> {
  const { rows } = await query<AuthUser>(
    `SELECT id, email, display_name, role, team_id, is_active
       FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export function issueToken(user: Pick<AuthUser, "id" | "email" | "role">): string {
  const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_TTL_SECONDS });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as TokenPayload;
    if (typeof decoded.sub !== "number") return null;
    if (typeof decoded.email !== "string") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function recordLoginSuccess(id: number): Promise<void> {
  await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [id]);
}
