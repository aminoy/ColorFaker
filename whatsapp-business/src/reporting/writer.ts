import fs from "fs";
import path from "path";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { query } from "../db/pool";
import { computeWeeklyMetrics, type WeeklyMetrics } from "./metrics";
import { toCSV, toJSON, toMarkdown } from "./formatters";

export interface WeeklyReportOutput {
  metrics: WeeklyMetrics;
  files: { csv: string; json: string; md: string };
}

export async function generateWeeklyReport(
  periodStart: Date,
  periodEnd: Date
): Promise<WeeklyReportOutput> {
  const metrics = await computeWeeklyMetrics(periodStart, periodEnd);

  const dir = path.resolve(env.REPORT_OUTPUT_DIR);
  fs.mkdirSync(dir, { recursive: true });

  const slug = `${periodStart.toISOString().slice(0, 10)}_${periodEnd.toISOString().slice(0, 10)}`;
  const csvPath = path.join(dir, `weekly-${slug}.csv`);
  const jsonPath = path.join(dir, `weekly-${slug}.json`);
  const mdPath = path.join(dir, `weekly-${slug}.md`);

  const md = toMarkdown(metrics);

  fs.writeFileSync(csvPath, toCSV(metrics));
  fs.writeFileSync(jsonPath, toJSON(metrics));
  fs.writeFileSync(mdPath, md);

  await query(
    `INSERT INTO weekly_reports (period_start, period_end, metrics, markdown)
     VALUES ($1::date, $2::date, $3::jsonb, $4)
     ON CONFLICT (period_start, period_end)
     DO UPDATE SET metrics = EXCLUDED.metrics, markdown = EXCLUDED.markdown, generated_at = NOW()`,
    [
      periodStart.toISOString().slice(0, 10),
      periodEnd.toISOString().slice(0, 10),
      JSON.stringify(metrics),
      md
    ]
  );

  logger.info({ csvPath, jsonPath, mdPath }, "weekly_report.written");
  return { metrics, files: { csv: csvPath, json: jsonPath, md: mdPath } };
}

export function previousWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  // End is the start of the current ISO week (Monday 00:00 UTC).
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayOfWeek = (d.getUTCDay() + 6) % 7; // 0 = Monday
  const end = new Date(d);
  end.setUTCDate(d.getUTCDate() - dayOfWeek);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);
  return { start, end };
}
