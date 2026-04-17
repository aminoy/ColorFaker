import type { Request, Response, NextFunction } from "express";
import express from "express";

/**
 * Captures the raw request body for HMAC signature validation.
 * Meta requires us to hash the byte-exact raw body, not the parsed JSON.
 */
export const jsonWithRawBody = express.json({
  limit: "1mb",
  verify: (req: Request, _res: Response, buf: Buffer) => {
    (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
  }
});

export function getRawBody(req: Request): Buffer | undefined {
  return (req as Request & { rawBody?: Buffer }).rawBody;
}

export function noop(_req: Request, _res: Response, next: NextFunction) {
  next();
}
