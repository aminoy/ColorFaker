import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../config/logger";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.PGPOOL_MAX
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected pg pool error");
});

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  const result = await pool.query(text, params as never);
  const durationMs = Date.now() - start;
  logger.debug({ sql: text.replace(/\s+/g, " ").slice(0, 120), durationMs }, "db.query");
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
}

export async function withTransaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
