import cron from "node-cron";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { generateWeeklyReport, previousWeekRange } from "../reporting/writer";

export function startWeeklyReportScheduler(): void {
  if (!cron.validate(env.WEEKLY_REPORT_CRON)) {
    logger.error({ cron: env.WEEKLY_REPORT_CRON }, "scheduler.invalid_cron");
    return;
  }
  cron.schedule(
    env.WEEKLY_REPORT_CRON,
    async () => {
      const { start, end } = previousWeekRange();
      logger.info({ start, end }, "scheduler.weekly_report.start");
      try {
        await generateWeeklyReport(start, end);
      } catch (err) {
        logger.error({ err }, "scheduler.weekly_report.failed");
      }
    },
    { timezone: env.REPORT_TIMEZONE }
  );
  logger.info(
    { cron: env.WEEKLY_REPORT_CRON, tz: env.REPORT_TIMEZONE },
    "scheduler.weekly_report.armed"
  );
}
