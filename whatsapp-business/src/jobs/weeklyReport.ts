import { pool } from "../db/pool";
import { logger } from "../config/logger";
import { generateWeeklyReport, previousWeekRange } from "../reporting/writer";

async function main() {
  const { start, end } = previousWeekRange();
  logger.info({ start, end }, "weekly_report.start");
  const { files } = await generateWeeklyReport(start, end);
  logger.info({ files }, "weekly_report.done");
}

if (require.main === module) {
  main()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error({ err }, "weekly_report.failed");
      await pool.end();
      process.exit(1);
    });
}
