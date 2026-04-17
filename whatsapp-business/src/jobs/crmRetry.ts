import cron from "node-cron";
import { logger } from "../config/logger";
import { retryFailedSyncs } from "../services/crm/crmDispatcher";

// Every 2 minutes: retry any crm_sync_logs that are due.
export function startCrmRetryScheduler(): void {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const n = await retryFailedSyncs();
      if (n > 0) logger.info({ retried: n }, "crm.retry.tick");
    } catch (err) {
      logger.error({ err }, "crm.retry.failed");
    }
  });
  logger.info("crm.retry.scheduled");
}
