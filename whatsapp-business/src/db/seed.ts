import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { pool, query } from "./pool";
import { logger } from "../config/logger";
import { runMigrations } from "./migrate";

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD ?? "changeme123";

const DEMO_USERS: Array<{
  email: string;
  name: string;
  role: "admin" | "manager" | "agent" | "viewer";
  team?: string;
}> = [
  { email: "admin@jabalomar.local",   name: "Platform Admin",   role: "admin",   team: "Customer Care" },
  { email: "manager@jabalomar.local", name: "Ops Manager",      role: "manager", team: "Customer Care" },
  { email: "agent@jabalomar.local",   name: "Agent One",        role: "agent",   team: "Hotel Bookings" },
  { email: "viewer@jabalomar.local",  name: "Executive Viewer", role: "viewer" }
];

async function runSqlSeeds() {
  const dir = path.resolve(__dirname, "../../seeds");
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    logger.info({ file: f }, "seed.sql.apply");
    await query(fs.readFileSync(path.join(dir, f), "utf8"));
  }
}

async function seedDemoUsers() {
  const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);
  for (const u of DEMO_USERS) {
    await query(
      `INSERT INTO users (email, display_name, password_hash, role, team_id)
       VALUES ($1, $2, $3, $4, (SELECT id FROM teams WHERE name = $5))
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash,
                                         display_name  = EXCLUDED.display_name,
                                         role          = EXCLUDED.role`,
      [u.email, u.name, hash, u.role, u.team ?? null]
    );
  }
  logger.info({ count: DEMO_USERS.length, password: "<<see env SEED_DEFAULT_PASSWORD>>" }, "seed.users.done");
}

async function main() {
  await runMigrations();
  await runSqlSeeds();
  await seedDemoUsers();
  logger.info("seed.complete");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error({ err }, "seed.failed");
    await pool.end();
    process.exit(1);
  });
