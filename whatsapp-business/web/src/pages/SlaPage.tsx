import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useI18n } from "../i18n/strings";

interface Risk {
  id: number; category_code: string | null; priority: string; status: string;
  first_response_due_at: string | null; resolution_due_at: string | null;
  first_response_at: string | null; resolved_at: string | null;
  minutes_until_first_response_due: number | null;
  minutes_until_resolution_due: number | null;
  first_response_breached: boolean; resolution_breached: boolean;
}

export function SlaPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Risk[]>([]);
  useEffect(() => {
    api.get<{ risks: Risk[] }>("/api/sla/risks").then((r) => setRows(r.risks));
  }, []);
  return (
    <div className="content">
      <div className="card">
        <h3>{t("sla_breaches")}</h3>
        <table>
          <thead>
            <tr>
              <th>#</th><th>{t("category")}</th><th>{t("priority")}</th><th>{t("status")}</th>
              <th>first response due</th><th>resolution due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link to={`/inbox/${r.id}`}>#{r.id}</Link></td>
                <td><span className={`badge b-${r.category_code}`}>{r.category_code ?? "—"}</span></td>
                <td><span className={`badge b-${r.priority}`}>{r.priority}</span></td>
                <td><span className={`badge b-${r.status}`}>{r.status}</span></td>
                <td className={r.first_response_breached ? "danger" : ""}>
                  {r.first_response_due_at ? new Date(r.first_response_due_at).toLocaleString() : "—"}
                  {r.minutes_until_first_response_due != null && !r.first_response_at &&
                    <span className="muted"> ({r.minutes_until_first_response_due.toFixed(0)}m)</span>}
                </td>
                <td className={r.resolution_breached ? "danger" : ""}>
                  {r.resolution_due_at ? new Date(r.resolution_due_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
