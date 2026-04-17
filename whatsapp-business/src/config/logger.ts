import pino from "pino";
import { env, isProd } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "jabal-omar-whatsapp" },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers['x-hub-signature-256']",
      "*.WHATSAPP_ACCESS_TOKEN",
      "*.WHATSAPP_APP_SECRET"
    ],
    censor: "[REDACTED]"
  },
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard", singleLine: true }
      }
});

export type Logger = typeof logger;
