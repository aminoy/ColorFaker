import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { InboxRow, Me, TimelineResponse, User } from "../api/types";
import { useI18n } from "../i18n/strings";

const CATEGORIES = ["hotel_booking", "retail_leasing", "vendor", "general_inquiry"];
const STATUSES = ["new", "bot_handled", "pending_human", "in_progress", "waiting_on_customer", "resolved", "archived"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

export function InboxPage({ me }: { me: Me }) {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedId = id ? Number(id) : null;

  const [rows, setRows] = useState<InboxRow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    priority: "",
    assignee_id: "",
    needs_human: "",
    unread: "",
    search: ""
  });

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (filters.category) qs.set("category", filters.category);
    if (filters.status)   qs.set("status", filters.status);
    if (filters.priority) qs.set("priority", filters.priority);
    if (filters.assignee_id) qs.set("assignee_id", filters.assignee_id);
    if (filters.needs_human === "1") qs.set("needs_human", "true");
    if (filters.unread === "1") qs.set("unread", "true");
    if (filters.search.trim()) qs.set("search", filters.search.trim());
    const resp = await api.get<{ conversations: InboxRow[] }>(`/api/inbox?${qs.toString()}`);
    setRows(resp.conversations);
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get<{ users: User[] }>("/api/users").then((r) => setUsers(r.users)).catch(() => undefined);
    const tm = setInterval(load, 10_000);
    return () => clearInterval(tm);
  }, [load]);

  return (
    <div className="inbox">
      <div className="pane">
        <div className="filters">
          <input
            placeholder={t("search_placeholder")}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ flex: "1 1 180px" }}
          />
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
            <option value="">{t("category")}: {t("all")}</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">{t("status")}: {t("all")}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">{t("priority")}: {t("all")}</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.assignee_id} onChange={(e) => setFilters({ ...filters, assignee_id: e.target.value })}>
            <option value="">{t("assignee")}: {t("all")}</option>
            <option value="unassigned">{t("unassigned")}</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.display_name}</option>)}
          </select>
          <select value={filters.needs_human} onChange={(e) => setFilters({ ...filters, needs_human: e.target.value })}>
            <option value="">{t("needs_human")}: {t("all")}</option>
            <option value="1">{t("needs_human")}</option>
          </select>
          <select value={filters.unread} onChange={(e) => setFilters({ ...filters, unread: e.target.value })}>
            <option value="">{t("unread")}: {t("all")}</option>
            <option value="1">{t("unread")}</option>
          </select>
        </div>
        {rows.map((r) => (
          <div
            key={r.id}
            className={`conv-item ${selectedId === r.id ? "active" : ""}`}
            onClick={() => navigate(`/inbox/${r.id}`)}
          >
            <div className="who">
              <span>{r.contact_name || r.wa_id}</span>
              <span className="muted">{new Date(r.last_message_at).toLocaleString()}</span>
            </div>
            <div className="snippet">{(r.last_message_body ?? "").slice(0, 80)}</div>
            <div className="meta">
              {r.category_code && <span className={`badge b-${r.category_code}`}>{r.category_code}</span>}
              <span className={`badge b-${r.status}`}>{r.status}</span>
              {r.priority !== "normal" && <span className={`badge b-${r.priority}`}>{r.priority}</span>}
              {r.unread_count > 0 && <span className="badge b-unread">{r.unread_count}</span>}
              {r.needs_human && <span className="badge">{t("needs_human")}</span>}
              {r.assignee_name && <span className="badge">{r.assignee_name}</span>}
              {r.first_response_due_at && !r.first_response_at &&
                new Date(r.first_response_due_at) < new Date() &&
                <span className="badge b-overdue">{t("overdue")}</span>}
            </div>
          </div>
        ))}
      </div>
      <ThreadPane conversationId={selectedId} me={me} users={users} onChanged={load} />
    </div>
  );
}

function ThreadPane({
  conversationId,
  me,
  users,
  onChanged
}: {
  conversationId: number | null;
  me: Me;
  users: User[];
  onChanged: () => void;
}) {
  const { t } = useI18n();
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  const canWrite = useMemo(() => me.role !== "viewer", [me.role]);

  const refresh = useCallback(async () => {
    if (!conversationId) { setData(null); return; }
    const d = await api.get<TimelineResponse>(`/api/conversations/${conversationId}`);
    setData(d);
    if ((d.conversation.unread_count as number) > 0) {
      api.post(`/api/conversations/${conversationId}/read`).catch(() => undefined);
    }
  }, [conversationId]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!conversationId) {
    return (
      <>
        <div className="thread" />
        <div className="pane" />
      </>
    );
  }
  if (!data) {
    return (
      <>
        <div className="thread"><div className="content muted">…</div></div>
        <div className="pane" />
      </>
    );
  }

  const conv = data.conversation;

  async function send() {
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await api.post(`/api/conversations/${conversationId}/reply`, { body: reply });
      setReply("");
      await refresh();
      onChanged();
    } finally { setBusy(false); }
  }

  async function saveNote() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await api.post(`/api/conversations/${conversationId}/notes`, { body: note });
      setNote("");
      await refresh();
    } finally { setBusy(false); }
  }

  async function changeStatus(status: string) {
    await api.post(`/api/conversations/${conversationId}/status`, { status });
    await refresh();
    onChanged();
  }

  async function changePriority(priority: string) {
    await api.post(`/api/conversations/${conversationId}/priority`, { priority });
    await refresh();
  }

  async function assign(assignee_id: number | null) {
    await api.post(`/api/conversations/${conversationId}/assign`, { assignee_id });
    await refresh();
    onChanged();
  }

  async function aiSuggest(kind: "reply" | "summary" | "priority" | "escalation") {
    setAiBusy(kind);
    try {
      const r = await api.post<{ content: string }>(
        `/api/conversations/${conversationId}/ai-suggest`,
        { kind }
      );
      if (kind === "reply") setReply(r.content);
      else if (kind === "summary") setNote((n) => (n ? `${n}\n\n` : "") + r.content);
      else alert(`${kind}: ${r.content}`);
    } finally { setAiBusy(null); }
  }

  return (
    <>
      <div className="thread">
        <div className="thread-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <b>{conv.display_name ?? conv.wa_id}</b>
            <span className="muted">{conv.wa_id}</span>
            <span className={`badge b-${conv.category_code}`}>{conv.category_code ?? "—"}</span>
            <span className={`badge b-${conv.status}`}>{conv.status}</span>
            <span className={`badge b-${conv.priority}`}>{conv.priority}</span>
          </div>
          <div className={data.service_window.open ? "muted" : "warning"} style={{ marginTop: 6 }}>
            {data.service_window.open ? t("service_window_open") : t("service_window_closed")}
          </div>
        </div>
        <div className="thread-body">
          {data.messages.map((m) => (
            <div key={m.id} className={`msg ${m.direction}`}>
              <div>{m.body}</div>
              <div className="when">
                {new Date(m.created_at).toLocaleString()}
                {m.author_name ? ` · ${m.author_name}` : ""}
              </div>
            </div>
          ))}
        </div>
        {canWrite && (
          <div className="composer">
            <textarea
              value={reply}
              placeholder={t("send_reply")}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="row">
              <button className="btn primary" onClick={send} disabled={busy || !reply.trim()}>
                {t("send_reply")}
              </button>
              <button className="btn small" onClick={() => aiSuggest("reply")} disabled={!!aiBusy}>
                {aiBusy === "reply" ? "…" : `${t("ai_suggest")}: reply`}
              </button>
              <button className="btn small" onClick={() => aiSuggest("summary")} disabled={!!aiBusy}>
                {aiBusy === "summary" ? "…" : "summary"}
              </button>
              <button className="btn small" onClick={() => aiSuggest("priority")} disabled={!!aiBusy}>priority</button>
              <button className="btn small" onClick={() => aiSuggest("escalation")} disabled={!!aiBusy}>escalation</button>
              <select value="" onChange={(e) => e.target.value && changeStatus(e.target.value)}>
                <option value="">{t("change_status")}</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value="" onChange={(e) => e.target.value && changePriority(e.target.value)}>
                <option value="">{t("change_priority")}</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {(me.role === "admin" || me.role === "manager") && (
                <select
                  value={conv.assignee_id ?? ""}
                  onChange={(e) =>
                    assign(e.target.value === "" ? null : Number(e.target.value))
                  }
                >
                  <option value="">{t("assign_to")}…</option>
                  <option value="">— {t("unassigned")} —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.display_name} ({u.role})</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}
      </div>
      <aside className="pane side-panel" style={{ padding: 14 }}>
        <h4>{t("lead_details")}</h4>
        {data.lead ? (
          <div>
            {Object.entries(data.lead).map(([k, v]) => (
              <div className="kv" key={k}><b>{k}</b><span>{v == null ? "—" : String(v)}</span></div>
            ))}
          </div>
        ) : <div className="muted">—</div>}

        <h4>{t("tags")}</h4>
        <TagEditor conversationId={conversationId} initial={(conv.tags as string[]) ?? []} onSaved={refresh} />

        <h4>{t("add_note")}</h4>
        {canWrite && (
          <>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            <button className="btn small" onClick={saveNote} disabled={busy || !note.trim()}>{t("add_note")}</button>
          </>
        )}
        <div style={{ marginTop: 8 }}>
          {data.notes.map((n) => (
            <div className="kv" key={n.id}>
              <b>{n.author_name ?? "—"}</b>
              <span>{n.body}</span>
            </div>
          ))}
        </div>

        <h4>{t("follow_ups")}</h4>
        <FollowUpCreator conversationId={conversationId} users={users} onSaved={refresh} />
        <div>
          {data.followUps.map((f) => (
            <div className="kv" key={f.id}>
              <b>{new Date(f.due_at).toLocaleString()}</b>
              <span>{f.owner_name ?? "—"} · {f.status} · {f.note ?? ""}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function TagEditor({
  conversationId,
  initial,
  onSaved
}: {
  conversationId: number;
  initial: string[];
  onSaved: () => void;
}) {
  const [tags, setTags] = useState<string[]>(initial);
  const [input, setInput] = useState("");
  useEffect(() => setTags(initial), [initial]);

  async function save(next: string[]) {
    setTags(next);
    await api.post(`/api/conversations/${conversationId}/tags`, { tags: next });
    onSaved();
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
        {tags.map((tg) => (
          <span className="badge" key={tg} onClick={() => save(tags.filter((x) => x !== tg))} style={{ cursor: "pointer" }}>
            {tg} ✕
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input.trim()) {
            save([...new Set([...tags, input.trim()])]);
            setInput("");
          }
        }}
        placeholder="+tag"
      />
    </div>
  );
}

function FollowUpCreator({
  conversationId,
  users,
  onSaved
}: {
  conversationId: number;
  users: User[];
  onSaved: () => void;
}) {
  const [ownerId, setOwnerId] = useState<string>("");
  const [due, setDue] = useState<string>(() =>
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [note, setNote] = useState("");

  async function create() {
    if (!due) return;
    await api.post(`/api/conversations/${conversationId}/follow-ups`, {
      owner_user_id: ownerId ? Number(ownerId) : null,
      due_at: new Date(due).toISOString(),
      note: note || undefined
    });
    setNote("");
    onSaved();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
      <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
        <option value="">— owner —</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.display_name}</option>)}
      </select>
      <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="note" />
      <button className="btn small" onClick={create}>+ follow-up</button>
    </div>
  );
}
