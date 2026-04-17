import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { OverviewMetrics } from "../api/types";
import { useI18n } from "../i18n/strings";

function fmtSeconds(s: number | null | undefined) {
  if (s == null) return "n/a";
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = s / 60;
  if (m < 60) return `${m.toFixed(1)}m`;
  return `${(m / 60).toFixed(2)}h`;
}

export function DashboardPage() {
  const { t } = useI18n();
  const [ov, setOv] = useState<OverviewMetrics | null>(null);
  const [cats, setCats] = useState<
    Array<{ category_code: string | null; conversations: number; leads: number; breaches: number; avg_first_response_seconds: number | null }>
  >([]);
  const [team, setTeam] = useState<
    Array<{ email: string | null; display_name: string | null; assigned_open: number; resolved: number; replies_sent: number; avg_first_response_seconds: number | null }>
  >([]);
  const [leads, setLeads] = useState<Array<{ category_code: string; total: number; with_contact: number; with_email: number }>>([]);
  const [bk, setBk] = useState<{ unassigned: number; pending_human: number; waiting_customer: number; overdue_first_response: number; overdue_resolution: number } | null>(null);

  useEffect(() => {
    api.get<OverviewMetrics>("/api/dashboard/overview").then(setOv);
    api.get<{ rows: typeof cats }>("/api/dashboard/categories").then((r) => setCats(r.rows));
    api.get<{ rows: typeof team }>("/api/dashboard/team").then((r) => setTeam(r.rows));
    api.get<{ rows: typeof leads }>("/api/dashboard/leads").then((r) => setLeads(r.rows));
    api.get<typeof bk>("/api/dashboard/backlog").then(setBk);
  }, []);

  return (
    <div className="content">
      <div className="grid kpi">
        <div className="card"><h3>{t("total_conversations")}</h3><div className="v">{ov?.totalConversations ?? "—"}</div></div>
        <div className="card"><h3>{t("open_conversations")}</h3><div className="v">{ov?.openConversations ?? "—"}</div></div>
        <div className="card"><h3>{t("resolved_conversations")}</h3><div className="v">{ov?.resolvedConversations ?? "—"}</div></div>
        <div className="card"><h3>{t("avg_first_response")}</h3><div className="v">{fmtSeconds(ov?.avgFirstResponseSeconds)}</div></div>
        <div className="card"><h3>{t("avg_resolution")}</h3><div className="v">{fmtSeconds(ov?.avgResolutionSeconds)}</div></div>
        <div className="card"><h3>{t("handoff_rate")}</h3><div className="v">{ov ? `${(ov.handoffRate * 100).toFixed(1)}%` : "—"}</div></div>
        <div className="card"><h3>{t("sla_breaches_count")}</h3><div className="v">{ov?.slaBreaches ?? "—"}</div></div>
      </div>

      <div className="card">
        <h3>{t("backlog")}</h3>
        {bk ? (
          <table>
            <tbody>
              <tr><th>unassigned</th><td>{bk.unassigned}</td></tr>
              <tr><th>pending_human</th><td>{bk.pending_human}</td></tr>
              <tr><th>waiting_on_customer</th><td>{bk.waiting_customer}</td></tr>
              <tr><th>overdue first response</th><td>{bk.overdue_first_response}</td></tr>
              <tr><th>overdue resolution</th><td>{bk.overdue_resolution}</td></tr>
            </tbody>
          </table>
        ) : <div className="muted">…</div>}
      </div>

      <div className="card">
        <h3>{t("category_breakdown")}</h3>
        <table>
          <thead><tr><th>category</th><th>conversations</th><th>leads</th><th>breaches</th><th>avg_first_resp</th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.category_code ?? "uncat"}>
                <td><span className={`badge b-${c.category_code}`}>{c.category_code ?? "uncategorized"}</span></td>
                <td>{c.conversations}</td>
                <td>{c.leads}</td>
                <td>{c.breaches}</td>
                <td>{fmtSeconds(c.avg_first_response_seconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{t("team_performance")}</h3>
        <table>
          <thead><tr><th>agent</th><th>assigned_open</th><th>resolved</th><th>replies_sent</th><th>avg_first_resp</th></tr></thead>
          <tbody>
            {team.map((r, i) => (
              <tr key={i}>
                <td>{r.display_name} <span className="muted">{r.email}</span></td>
                <td>{r.assigned_open}</td>
                <td>{r.resolved}</td>
                <td>{r.replies_sent}</td>
                <td>{fmtSeconds(r.avg_first_response_seconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{t("leads_analytics")}</h3>
        <table>
          <thead><tr><th>category</th><th>total</th><th>with_contact</th><th>with_email</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.category_code}>
                <td><span className={`badge b-${l.category_code}`}>{l.category_code}</span></td>
                <td>{l.total}</td>
                <td>{l.with_contact}</td>
                <td>{l.with_email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Export</h3>
        <a className="btn" href="/api/export/leads.csv">{t("export_leads")}</a>{" "}
        <a className="btn" href="/api/export/conversations.csv">{t("export_conversations")}</a>
      </div>
    </div>
  );
}
