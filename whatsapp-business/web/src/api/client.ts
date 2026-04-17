/**
 * Lightweight fetch wrapper. Cookies are sent automatically; when the API
 * issues the CSRF double-submit cookie (`jo_csrf`), we echo it in the
 * `X-CSRF-Token` header on unsafe requests.
 */
function csrfToken(): string | null {
  const m = document.cookie.match(/(?:^|; )jo_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  opts: { raw?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  const token = csrfToken();
  if (token && method !== "GET") headers["x-csrf-token"] = token;

  const resp = await fetch(url, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw Object.assign(new Error(text || resp.statusText), {
      status: resp.status,
      body: text
    });
  }
  if (opts.raw) return resp as unknown as T;
  const ct = resp.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return (await resp.text()) as unknown as T;
  return (await resp.json()) as T;
}

export const api = {
  get:  <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body),
  del:  <T>(url: string) => request<T>("DELETE", url),
  raw:  (url: string) => request<Response>("GET", url, undefined, { raw: true })
};
