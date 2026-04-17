import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { User } from "../api/types";
import { useI18n } from "../i18n/strings";

export function UsersPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<User[]>([]);
  const [form, setForm] = useState({ email: "", display_name: "", password: "", role: "agent" as User["role"] });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await api.get<{ users: User[] }>("/api/users");
    setRows(r.users);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await api.post("/api/users", form);
      setForm({ email: "", display_name: "", password: "", role: "agent" });
      load();
    } catch (e) {
      setErr((e as Error).message || "error");
    }
  }

  return (
    <div className="content">
      <div className="card">
        <h3>{t("users")}</h3>
        <table>
          <thead><tr><th>email</th><th>name</th><th>role</th><th>team</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td><td>{u.display_name}</td><td><span className="badge">{u.role}</span></td><td>{u.team_id ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="card" onSubmit={create}>
        <h3>+ user</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="display name" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          <input type="password" placeholder="password (min 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User["role"] })}>
            <option>admin</option><option>manager</option><option>agent</option><option>viewer</option>
          </select>
          <button className="btn primary" type="submit">create</button>
        </div>
        {err && <div className="err danger">{err}</div>}
      </form>
    </div>
  );
}
