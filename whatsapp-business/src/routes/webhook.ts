import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { jsonWithRawBody } from "../middleware/rawBody";
import {
  receiveWebhook,
  verifyWebhook
} from "../controllers/webhookController";

export const webhookRouter = Router();

const limiter = rateLimit({
  windowMs: env.WEBHOOK_RATE_LIMIT_WINDOW_MS,
  max: env.WEBHOOK_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});

webhookRouter.get("/webhook", verifyWebhook);
webhookRouter.post("/webhook", limiter, jsonWithRawBody, receiveWebhook);
