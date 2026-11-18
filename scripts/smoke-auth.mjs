/**
 * End-to-end smoke test for the renamed auth collections:
 * signs up a throwaway user, reads the session back and prints the stored
 * user fields (role / plan / phone / bio / image).
 * The test user is left in the DB for cleanup by scripts/cleanup-smoke.mjs.
 * Usage: node scripts/smoke-auth.mjs
 */
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const EMAIL = "spec-smoke-test@example.com";
const PASSWORD = "SmokeTest12345!";

const headers = { "content-type": "application/json", origin: BASE };

// 1. sign up (falls back to sign-in if the user already exists)
let cookie = "";
let signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "Spec Smoke Test",
    email: EMAIL,
    password: PASSWORD,
    role: "student",
  }),
});
console.log("sign-up:", signup.status, await signup.text());

if (!signup.ok) {
  const signin = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  console.log("sign-in:", signin.status, await signin.text());
  if (!signin.ok) process.exit(1);
  cookie = (signin.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
} else {
  cookie = (signup.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
}

// 2. read the session back — this is what queries the users/sessions tables
const session = await fetch(`${BASE}/api/auth/get-session`, {
  headers: { cookie },
});
const body = await session.json();
console.log("get-session:", session.status);
console.log(
  "user fields:",
  Object.keys(body?.user ?? {}).sort().join(", ")
);
console.log(
  "plan/phone/bio/role/image:",
  JSON.stringify({
    plan: body?.user?.plan,
    phone: body?.user?.phone,
    bio: body?.user?.bio,
    role: body?.user?.role,
    image: body?.user?.image ?? null,
  })
);

const ok =
  session.ok &&
  body?.user?.plan === "free" &&
  body?.user?.role === "student" &&
  "phone" in (body?.user ?? {}) &&
  "bio" in (body?.user ?? {});
console.log(ok ? "SMOKE TEST PASSED" : "SMOKE TEST FAILED");
process.exit(ok ? 0 : 1);
