import type { NextFunction, Request, Response } from "express";
import { requireRole } from "../../src/middleware/auth";

function mockReq(role: "admin" | "manager" | "agent" | "viewer" | undefined = undefined) {
  return {
    user: role
      ? { id: 1, email: "u@x", role, display_name: "U", team_id: null, is_active: true }
      : undefined
  } as unknown as Request;
}
function mockRes() {
  const data: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) { data.status = code; return res; },
    json(body: unknown)  { data.body = body;  return res; }
  } as unknown as Response;
  return { res, data };
}

describe("requireRole", () => {
  it("401 when unauthenticated", () => {
    const next = jest.fn() as unknown as NextFunction;
    const { res, data } = mockRes();
    requireRole("admin")(mockReq(undefined), res, next);
    expect(data.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("403 when role not allowed", () => {
    const next = jest.fn() as unknown as NextFunction;
    const { res, data } = mockRes();
    requireRole("admin")(mockReq("viewer"), res, next);
    expect(data.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("passes through when role is allowed", () => {
    const next = jest.fn() as unknown as NextFunction;
    const { res, data } = mockRes();
    requireRole("admin", "manager")(mockReq("manager"), res, next);
    expect(data.status).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
