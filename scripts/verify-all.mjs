const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const headers = { "content-type": "application/json", origin: BASE };

console.log("=== 1. Checking Public Routes ===");
for (const path of ["/", "/about", "/how-it-works", "/pricing", "/tuitions", "/sign-in", "/sign-up"]) {
  const res = await fetch(`${BASE}${path}`);
  console.log(`GET ${path} => ${res.status}`);
  if (path === "/") {
    const html = await res.text();
    const checks = [
      "MentorLagbe",
      "Browse Tuitions",
      "Pricing / Pro Plans",
      "How It Works / About",
      "Sign In",
      "Sign Up",
    ];
    for (const check of checks) {
      const found = html.includes(check);
      console.log(`  - Contains "${check}": ${found ? "YES" : "NO"}`);
    }
  }
}

console.log("\n=== 2. Checking Role Sign-In & Dashboard Access ===");
const roles = [
  { role: "student", email: "student@mentorlagbe.com", pass: "Student12345!" },
  { role: "tutor", email: "tutor@mentorlagbe.com", pass: "Tutor12345!" },
  { role: "admin", email: "admin@mentorlagbe.com", pass: "Admin12345!" },
];

for (const { role, email, pass } of roles) {
  const signinRes = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password: pass }),
  });
  console.log(`[${role}] sign-in status:`, signinRes.status);
  const cookie = (signinRes.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");

  const sessionRes = await fetch(`${BASE}/api/auth/get-session`, {
    headers: { cookie },
  });
  const sessionData = await sessionRes.json();
  console.log(`[${role}] session user role:`, sessionData?.user?.role, `(expected: ${role})`);

  // Check role dashboard
  const dashRes = await fetch(`${BASE}/dashboard/${role}`, {
    headers: { cookie },
    redirect: "manual",
  });
  console.log(`[${role}] GET /dashboard/${role} status:`, dashRes.status);
}

console.log("\nALL VERIFICATIONS COMPLETE.");
