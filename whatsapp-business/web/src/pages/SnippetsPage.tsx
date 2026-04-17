import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { CannedReply } from "../api/types";
import { useI18n } from "../i18n/strings";

const CATEGORIES = ["hotel_booking", "retail_leasing", "vendor", "general_inquiry"];

export function SnippetsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<CannedReply[]>([]);
  const [form, setForm] = useState<{
    id?: number;
    code: string;
    language: "ar" | "en";
    title: string;
    body: string;
    category_code: string | null;
  }>({ code: "", language: "ar", title: "", body: "", category_code: null });
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await api.get<{ canned: CannedReply[] }>(`/api/canned-replies?all=true`);
    setItems(r.canned);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await api.post("/api/canned-replies", form);
      setForm({ code: "", language: "ar", title: "", body: "", category_code: null });
      await load();
    } catch (e) { setErr((e as Error).message); }
  }

  async function edit(row: CannedReply) {
    setForm({
      id: row.id,
      code: row.code,
      language: row.language,
      title: row.title,
      body: row.body,
      category_code: row.category_code
    });
  }

  async function remove(id: number) {
    if (!confirm("delete?")) return;
    await api.del(`/api/canned-replies/${id}`);
    await load();
  }

  return (
    <div className="content">
      <div className="card">
        <h3>{t("canned_replies")}</h3>
        <table>
          <thead><tr><th>code</th><th>lang</th><th>title</th><th>category</th><th>body</th><th></th></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>/{r.code}</td>
                <td>{r.language}</td>
                <td>{r.title}</td>
                <td>{r.category_code ?? "—"}</td>
                <td style={{ maxWidth: 380, whiteSpace: "pre-wrap" }}>{r.body}</td>
                <td>
                  <button className="btn small" onClick={() => edit(r)}>edit</button>{" "}
                  <button className="btn small" onClick={() => remove(r.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="card" onSubmit={save} style={{ maxWidth: 640 }}>
        <h3>{form.id ? "edit" : "+ snippet"}</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input placeholder="code (e.g. hotel_dates)" value={form.code}
                 onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as "ar" | "en" })}>
            <option>ar</option><option>en</option>
          </select>
          <select value={form.category_code ?? ""} onChange={(e) => setForm({ ...form, category_code: e.target.value || null })}>
            <option value="">(any)</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="title" value={form.title}
                 onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ flex: 1 }} />
        </div>
        <textarea placeholder="body" value={form.body} rows={4}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required style={{ width: "100%", marginTop: 8 }} />
        <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
          <button className="btn primary" type="submit">{form.id ? "save" : "create"}</button>
          {form.id && (
            <button className="btn small" type="button" onClick={() =>
              setForm({ code: "", language: "ar", title: "", body: "", category_code: null })}>reset</button>
          )}
        </div>
        {err && <div className="danger" style={{ marginTop: 8 }}>{err}</div>}
      </form>
    </div>
  );
}
