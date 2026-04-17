import { useState } from "react";
import { api } from "../api/client";
import { useI18n } from "../i18n/strings";

export function LoginPage({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("admin@jabalomar.local");
  const [password, setPassword] = useState("changeme123");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api.post("/auth/login", { email, password });
      onLoggedIn();
    } catch {
      setErr(t("invalid_credentials"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h2>{t("app_title")}</h2>
        <label>{t("email")}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <label>{t("password")}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="err">{err}</div>}
        <button type="submit" disabled={busy}>{busy ? "…" : t("sign_in")}</button>
      </form>
    </div>
  );
}
