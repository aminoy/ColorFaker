import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Me } from "../api/types";
import { useI18n } from "../i18n/strings";

interface FU {
  id: number; conversation_id: number; owner_user_id: number | null;
  due_at: string; note: string | null; status: string; owner_name: string | null;
}

export function FollowUpsPage({ me }: { me: Me }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<FU[]>([]);
  const [filter, setFilter] = useState<"mine" | "all" | "overdue">("mine");

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (filter === "mine") qs.set("owner", "me");
    if (filter === "overdue") qs.set("overdue", "true");
    qs.set("status", "pending");
    const r = await api.get<{ followUps: FU[] }>(`/api/follow-ups?${qs.toString()}`);
    setRows(r.followUps);
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  async function complete(id: number) {
    await api.post(`/api/follow-ups/${id}/complete`);
    load();
  }

  return (
    <div className="content">
      <div className="card">
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button className={`btn small ${filter === "mine" ? "primary" : ""}`} onClick={() => setFilter("mine")}>mine</button>
          <button className={`btn small ${filter === "all" ? "primary" : ""}`} onClick={() => setFilter("all")}>all</button>
          <button className={`btn small ${filter === "overdue" ? "primary" : ""}`} onClick={() => setFilter("overdue")}>{t("overdue")}</button>
        </div>
        <table>
          <thead><tr><th>{t("due_at")}</th><th>{t("owner")}</th><th>{t("note")}</th><th></th></tr></thead>
          <tbody>
            {rows.map((f) => {
              const overdue = new Date(f.due_at) < new Date();
              return (
                <tr key={f.id}>
                  <td className={overdue ? "danger" : ""}>{new Date(f.due_at).toLocaleString()}</td>
                  <td>{f.owner_name ?? me.display_name}</td>
                  <td>
                    <Link to={`/inbox/${f.conversation_id}`}>#{f.conversation_id}</Link>
                    {f.note && <> — {f.note}</>}
                  </td>
                  <td>
                    <button className="btn small" onClick={() => complete(f.id)}>{t("done")}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
