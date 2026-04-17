import cron from "node-cron";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { runSlaNotifierOnce } from "../services/slaNotifier";

export function startSlaNotifierScheduler(): void {
  if (!env.SLA_ALERTS_ENABLED) {
    logger.info("sla.notifier.disabled");
    return;
  }
  if (!cron.validate(env.SLA_ALERTS_POLL_CRON)) {
    logger.error({ cron: env.SLA_ALERTS_POLL_CRON }, "sla.notifier.invalid_cron");
    return;
  }
  cron.schedule(env.SLA_ALERTS_POLL_CRON, async () => {
    try {
      const n = await runSlaNotifierOnce();
      if (n > 0) logger.info({ breaches: n }, "sla.notifier.tick");
    } catch (err) {
      logger.error({ err }, "sla.notifier.failed");
    }
  });
  logger.info({ cron: env.SLA_ALERTS_POLL_CRON }, "sla.notifier.scheduled");
}
