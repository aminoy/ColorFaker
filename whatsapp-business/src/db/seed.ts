import fs from "fs";
import path from "path";
import { pool, query } from "./pool";
import { logger } from "../config/logger";
import { runMigrations } from "./migrate";

async function main() {
  await runMigrations();

  const seedSqlPath = path.resolve(__dirname, "../../seeds/001_seed.sql");
  if (fs.existsSync(seedSqlPath)) {
    const sql = fs.readFileSync(seedSqlPath, "utf8");
    logger.info("seeding from 001_seed.sql");
    await query(sql);
  }

  logger.info("seeding complete");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error({ err }, "seed failed");
    await pool.end();
    process.exit(1);
  });
