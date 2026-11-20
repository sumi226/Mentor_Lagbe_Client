/**
 * End-to-end smoke test for the JWT integration:
 *   1. signs in and reads the session cookie
 *   2. fetches a JWT from GET /api/auth/token
 *   3. decodes it (client-side view) and checks the payload
 *   4. calls a protected API with `Authorization: Bearer …` and NO cookie —
 *      it must authenticate (403 = "you are known, but wrong role", 401 =
 *      "not authenticated") and prove the token is being honoured
 *   5. calls it with no credentials at all — must be 401
 *
 * Needs a server on :3000 (npm run dev). Reuses the throwaway user from
 * scripts/smoke-auth.mjs; cleanup with scripts/cleanup-smoke.mjs.
 * Usage: node scripts/smoke-jwt.mjs
 */
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const EMAIL = "spec-smoke-test@example.com";
const PASSWORD = "SmokeTest12345!";

const headers = { "content-type": "application/json", origin: BASE };
const failures = [];

function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

// 1. session cookie (sign-in; fall back to sign-up when the user is missing)
async function getSessionCookie() {
  for (const path of ["/api/auth/sign-in/email", "/api/auth/sign-up/email"]) {
    const body =
      path === "/api/auth/sign-in/email"
        ? { email: EMAIL, password: PASSWORD }
        : { name: "Spec Smoke Test", email: EMAIL, password: PASSWORD, role: "student" };
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return (res.headers.getSetCookie?.() ?? [])
        .map((c) => c.split(";")[0])
        .join("; ");
    }
  }
  return "";
}

const cookie = await getSessionCookie();
check("signed in", Boolean(cookie));

// 2. JWT — this is exactly what the client does after login
const tokenRes = await fetch(`${BASE}/api/auth/token`, {
  headers: { ...headers, cookie },
});
const tokenBody = await tokenRes.json().catch(() => ({}));
const token = tokenBody.token;
check("GET /api/auth/token", tokenRes.ok && typeof token === "string", `${tokenRes.status}`);

if (token) {
  // 3. client-side decode (no verification — just what the browser sees)
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
  );
  console.log("JWT payload keys:", Object.keys(payload).sort().join(", "));
  check(
    "payload carries the user",
    Boolean(payload.sub && payload.email && payload.role),
    `sub=${payload.sub} email=${payload.email} role=${payload.role} exp=${payload.exp}`
  );

  // 4. protected request with the bearer token only (no cookies)
  const authed = await fetch(`${BASE}/api/tuitions`, {
    method: "POST",
    headers: { ...headers, authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
  const authedBody = await authed.json().catch(() => ({}));
  // 403 = authenticated (student role rejected) · 401 = token ignored
  check(
    "bearer token authenticates a protected route",
    authed.status === 403,
    `status ${authed.status} (${authedBody.message ?? authedBody.error ?? "no message"})`
  );

  // 5. a garbage token must not authenticate anything
  const forged = await fetch(`${BASE}/api/tuitions`, {
    method: "POST",
    headers: { ...headers, authorization: "Bearer not.a.real.token" },
    body: JSON.stringify({}),
  });
  check("forged token rejected", forged.status === 401, `status ${forged.status}`);
}

// 6. anonymous request must still be 401
const anon = await fetch(`${BASE}/api/tuitions`, {
  method: "POST",
  headers,
  body: JSON.stringify({}),
});
check("anonymous request rejected", anon.status === 401, `status ${anon.status}`);

console.log(failures.length === 0 ? "JWT SMOKE TEST PASSED" : `JWT SMOKE TEST FAILED: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
