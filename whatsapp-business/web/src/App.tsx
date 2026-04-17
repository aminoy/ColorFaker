import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { api } from "./api/client";
import type { Me } from "./api/types";
import { useI18n } from "./i18n/strings";
import { LoginPage } from "./pages/LoginPage";
import { InboxPage } from "./pages/InboxPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FollowUpsPage } from "./pages/FollowUpsPage";
import { SlaPage } from "./pages/SlaPage";
import { AuditPage } from "./pages/AuditPage";
import { UsersPage } from "./pages/UsersPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SnippetsPage } from "./pages/SnippetsPage";

export function App() {
  const { t, locale, setLocale } = useI18n();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const location = useLocation();

  async function refreshMe() {
    try {
      const u = await api.get<Me>("/auth/me");
      setMe(u);
    } catch {
      setMe(null);
    }
  }

  useEffect(() => { refreshMe(); }, []);

  if (me === undefined) return <div className="login"><div className="muted">…</div></div>;

  if (!me) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLoggedIn={refreshMe} />} />
        <Route path="*" element={<Navigate to="/login" replace state={{ from: location }} />} />
      </Routes>
    );
  }

  const doLogout = async () => {
    await api.post("/auth/logout");
    setMe(null);
  };

  const navItem = (to: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
  );

  return (
    <div className="app">
      <nav className="nav">
        <h1>{t("app_title")}</h1>
        {navItem("/inbox", t("inbox"))}
        {navItem("/dashboard", t("dashboard"))}
        {navItem("/follow-ups", t("follow_ups"))}
        {navItem("/sla", t("sla_breaches"))}
        {(me.role === "admin" || me.role === "manager") && navItem("/snippets", t("canned_replies"))}
        {(me.role === "admin" || me.role === "manager") && navItem("/audit", t("audit"))}
        {me.role === "admin" && navItem("/users", t("users"))}
        {navItem("/settings", t("change_password"))}
        <div className="meta">
          <div>{me.display_name} · <span className="muted">{me.role}</span></div>
          <div style={{ marginTop: 6 }}>
            <button className="btn small" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}>
              {locale === "ar" ? "EN" : "AR"}
            </button>
            {" "}
            <button className="btn small" onClick={doLogout}>{t("logout")}</button>
          </div>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/inbox/:id?" element={<InboxPage me={me} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/follow-ups" element={<FollowUpsPage me={me} />} />
          <Route path="/sla" element={<SlaPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/snippets" element={<SnippetsPage />} />
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
      </main>
    </div>
  );
}
