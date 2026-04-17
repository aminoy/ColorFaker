import fs from "fs";
import path from "path";
import { pool, query } from "./pool";
import { logger } from "../config/logger";

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function applied(): Promise<Set<string>> {
  const { rows } = await query<{ filename: string }>(
    "SELECT filename FROM schema_migrations"
  );
  return new Set(rows.map((r) => r.filename));
}

export async function runMigrations(dir: string = path.resolve(__dirname, "../../migrations")) {
  await ensureMigrationsTable();
  const done = await applied();
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    if (done.has(file)) {
      logger.info({ file }, "migration.skip");
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    logger.info({ file }, "migration.apply");
    await query("BEGIN");
    try {
      await query(sql);
      await query("INSERT INTO schema_migrations(filename) VALUES ($1)", [file]);
      await query("COMMIT");
      logger.info({ file }, "migration.done");
    } catch (err) {
      await query("ROLLBACK");
      logger.error({ err, file }, "migration.failed");
      throw err;
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error({ err }, "migrations failed");
      await pool.end();
      process.exit(1);
    });
}
