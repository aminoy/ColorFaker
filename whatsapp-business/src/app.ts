import path from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { logger } from "./config/logger";
import { healthRouter } from "./routes/health";
import { webhookRouter } from "./routes/webhook";
import { adminRouter } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { apiRouter } from "./routes/api";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Access logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info(
        {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Date.now() - start
        },
        "http.request"
      );
    });
    next();
  });

  app.use(cookieParser());
  app.use(healthRouter);

  // Webhook router uses its own JSON parser (raw body + HMAC).
  app.use(webhookRouter);

  // Auth endpoints (public).
  app.use("/auth", authRouter);

  // Authenticated API (inbox, dashboard, etc.).
  app.use("/api", apiRouter);

  // Legacy admin endpoints (unauthenticated — DEPRECATED; superseded by /api).
  app.use("/admin", express.json({ limit: "256kb" }), adminRouter);

  // Serve the built React web app if present (docker build produces it).
  const webDist = path.resolve(__dirname, "../web/dist");
  if (fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get(/^\/(?!api\/|auth\/|webhook|healthz|readyz|admin\/).*/, (_req, res) => {
      res.sendFile(path.join(webDist, "index.html"));
    });
  }

  // 404 + error handlers
  app.use((_req, res) => res.status(404).json({ error: "not_found" }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "unhandled_error");
    res.status(500).json({ error: "internal_server_error" });
  });

  return app;
}
