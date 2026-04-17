import { useState } from "react";
import { api } from "../api/client";
import { useI18n } from "../i18n/strings";

export function SettingsPage() {
  const { t } = useI18n();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function change(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    try {
      await api.post("/auth/password", { current_password: cur, new_password: next });
      setCur(""); setNext("");
      setMsg(t("password_changed"));
    } catch {
      setErr(t("password_change_failed"));
    } finally { setBusy(false); }
  }

  return (
    <div className="content">
      <form className="card" onSubmit={change} style={{ maxWidth: 420 }}>
        <h3>{t("change_password")}</h3>
        <label>{t("current_password")}</label>
        <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required />
        <label style={{ marginTop: 8 }}>{t("new_password")}</label>
        <input type="password" value={next} onChange={(e) => setNext(e.target.value)} minLength={8} required />
        <div style={{ marginTop: 8 }}>
          <button className="btn primary" type="submit" disabled={busy || !cur || next.length < 8}>
            {busy ? "…" : t("change_password")}
          </button>
        </div>
        {msg && <div style={{ color: "var(--accent)", marginTop: 8 }}>{msg}</div>}
        {err && <div className="danger" style={{ marginTop: 8 }}>{err}</div>}
      </form>
    </div>
  );
}
