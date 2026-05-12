import { getPortalApiBaseUrl } from "./apiBaseUrl";

const API_URL = getPortalApiBaseUrl();
const TOKEN_KEY = "pc_portal_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

// ── In-memory GET cache ────────────────────────────────────────────────────────
// Each tab switch was hitting production over the network. With this cache,
// a previously-visited page paints from cache instantly while a background
// refresh keeps data fresh.

type CacheEntry = { data: unknown; ts: number };
const memCache = new Map<string, CacheEntry>();

export function peekCache<T>(path: string): T | null {
  const e = memCache.get(path);
  return e ? (e.data as T) : null;
}

export function setCache<T>(path: string, data: T): void {
  memCache.set(path, { data, ts: Date.now() });
}

export function invalidateCache(path?: string): void {
  if (path) memCache.delete(path);
  else memCache.clear();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
