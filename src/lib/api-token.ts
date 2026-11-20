/**
 * Client-side JWT handling (spec: "JWT Token Integration").
 *
 * Immediately after a sign-in / sign-up we ask better-auth's JWT plugin for
 * a token (GET /api/auth/token), cache it in localStorage until it is close
 * to expiring, and attach it as `Authorization: Bearer <token>` to every
 * protected /api request. The API routes verify the token server-side —
 * see src/lib/api-auth.ts — and fall back to the session cookie.
 */

const STORAGE_KEY = "mentor_lagbe_jwt";
/** Refresh the token when it is closer than this to its expiry. */
const REFRESH_MARGIN_MS = 30_000;
/** Fallback lifetime when the token's `exp` claim can't be read (15 min). */
const DEFAULT_TTL_MS = 15 * 60_000;

let inflight: Promise<string | null> | null = null;

type CachedToken = { token: string; expiresAt: number };

function loadCache(): CachedToken | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedToken>;
    return typeof parsed.token === "string"
      ? { token: parsed.token, expiresAt: Number(parsed.expiresAt ?? 0) }
      : null;
  } catch {
    return null;
  }
}

function saveCache(token: string) {
  if (typeof window === "undefined") return;
  const expiresAt = readExpiry(token) || Date.now() + DEFAULT_TTL_MS;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, expiresAt } satisfies CachedToken)
    );
  } catch {
    // private mode / storage full — the token still works for this request
  }
}

/** Reads the `exp` claim (ms) out of a JWT without verifying it. */
function readExpiry(token: string): number {
  try {
    const payload = token.split(".")[1] ?? "";
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json: unknown = JSON.parse(atob(base64));
    const exp = (json as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Drops the cached token — called on sign-out. */
export function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns a valid JWT, fetching a fresh one from better-auth when the cached
 * copy is missing or about to expire. Concurrent callers share one request.
 */
export async function fetchAuthToken(force = false): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const cached = loadCache();
  if (
    !force &&
    cached &&
    cached.expiresAt - Date.now() > REFRESH_MARGIN_MS
  ) {
    return cached.token;
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/api/auth/token", {
        headers: { Accept: "application/json" },
        // same-origin by default → the session cookie rides along
      });
      if (!res.ok) return cached?.token ?? null;
      const data = (await res.json().catch(() => ({}))) as { token?: unknown };
      if (typeof data.token !== "string" || !data.token) {
        return cached?.token ?? null;
      }
      saveCache(data.token);
      return data.token;
    } catch {
      return cached?.token ?? null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/**
 * Headers to spread into `fetch` for a protected API request. Returns an
 * empty object when no token is available (the session cookie still applies).
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await fetchAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
