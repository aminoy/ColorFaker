import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { startWeeklyReportScheduler } from "./jobs/scheduler";
import { startQueueWorker } from "./services/outboundQueue";
import { startCrmRetryScheduler } from "./jobs/crmRetry";
import { startSlaNotifierScheduler } from "./jobs/slaNotifierJob";

async function main() {
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "server.started");
  });

  startWeeklyReportScheduler();
  startQueueWorker();
  startCrmRetryScheduler();
  startSlaNotifierScheduler();
}

main().catch((err) => {
  logger.fatal({ err }, "server.boot_failed");
  process.exit(1);
});
