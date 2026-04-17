import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useI18n } from "../i18n/strings";

interface Row {
  id: number; actor_user_id: number | null; actor_email: string | null;
  event: string; entity_type: string | null; entity_id: number | null;
  metadata: Record<string, unknown>; ip: string | null; created_at: string;
}

export function AuditPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    api.get<{ logs: Row[] }>("/api/audit").then((r) => setRows(r.logs));
  }, []);
  return (
    <div className="content">
      <div className="card">
        <h3>{t("audit")}</h3>
        <table>
          <thead><tr><th>when</th><th>actor</th><th>event</th><th>entity</th><th>metadata</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.actor_email ?? "—"}</td>
                <td><span className="badge">{r.event}</span></td>
                <td>{r.entity_type ?? ""}{r.entity_id ? `#${r.entity_id}` : ""}</td>
                <td className="muted" style={{ fontFamily: "ui-monospace,monospace", fontSize: 11 }}>
                  {JSON.stringify(r.metadata)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
