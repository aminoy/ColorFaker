import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default("info"),

  WHATSAPP_ACCESS_TOKEN: z.string().min(1).default("PLACEHOLDER_TOKEN"),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).default("PLACEHOLDER_PHONE_ID"),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  WHATSAPP_API_VERSION: z.string().default("v20.0"),
  WHATSAPP_API_BASE_URL: z.string().url().default("https://graph.facebook.com"),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1).default("verify_me"),
  WHATSAPP_APP_SECRET: z.string().min(1).default("app_secret_placeholder"),

  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgres://whatsapp:whatsapp@localhost:5432/whatsapp"),
  PGPOOL_MAX: z.coerce.number().int().positive().default(10),

  REPORT_OUTPUT_DIR: z.string().default("./reports"),
  WEEKLY_REPORT_CRON: z.string().default("0 7 * * 1"),
  REPORT_TIMEZONE: z.string().default("Asia/Riyadh"),

  WEBHOOK_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  WEBHOOK_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

  COMPANY_NAME_AR: z.string().default("شركة جبل عمر للتطوير"),
  COMPANY_NAME_EN: z.string().default("Jabal Omar Development Company"),
  VENDOR_PORTAL_URL: z.string().url().default("https://jabalomar.com.sa/en/vendors-portal/"),

  // Auth
  JWT_SECRET: z.string().min(16).default("dev_only_jwt_secret_please_rotate__________"),
  JWT_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 8),
  AUTH_COOKIE_NAME: z.string().default("jo_auth"),
  AUTH_COOKIE_SECURE: z.coerce.boolean().default(false),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  // Outbound queue + 24h window
  OUTBOUND_QUEUE_POLL_MS: z.coerce.number().int().positive().default(2_000),
  OUTBOUND_QUEUE_BATCH_SIZE: z.coerce.number().int().positive().default(10),
  OUTBOUND_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  WHATSAPP_SERVICE_WINDOW_HOURS: z.coerce.number().int().positive().default(24),
  WHATSAPP_DEFAULT_TEMPLATE_NAME: z.string().default(""),
  WHATSAPP_DEFAULT_TEMPLATE_LANG: z.string().default("ar"),

  // CRM
  CRM_ADAPTER: z.enum(["mock", "webhook", "disabled"]).default("mock"),
  CRM_WEBHOOK_URL: z.string().optional(),
  CRM_WEBHOOK_AUTH_HEADER: z.string().optional(),
  CRM_RETRY_MAX: z.coerce.number().int().positive().default(5),

  // AI
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  AI_ASSIST_ENABLED: z.coerce.boolean().default(true)
});

export type AppEnv = z.infer<typeof schema>;

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: AppEnv = parsed.data;

export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
