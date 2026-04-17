import express from "express";
import { logger } from "./config/logger";
import { healthRouter } from "./routes/health";
import { webhookRouter } from "./routes/webhook";
import { adminRouter } from "./routes/admin";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  // Access logging with per-request ids
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

  app.use(healthRouter);

  // Webhook router uses its own JSON parser with raw-body capture.
  app.use(webhookRouter);

  // Admin endpoints use a normal JSON parser.
  app.use("/admin", express.json({ limit: "256kb" }), adminRouter);

  // 404 fallback
  app.use((_req, res) => res.status(404).json({ error: "not_found" }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, "unhandled_error");
    res.status(500).json({ error: "internal_server_error" });
  });

  return app;
}
