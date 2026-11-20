/**
 * End-to-end check of the Browse Tuitions page (/tuitions):
 *   - lists only approvalStatus "approved" + isActive: true posts
 *   - search (?q=) matches title/subject and excludes other posts
 *   - Subject / Class Level / Mode dropdowns actually narrow the results
 *
 * Reads the expected sets from MongoDB and the rendered HTML from the
 * running server (npm run start / npm run dev on :3000).
 * Usage: node scripts/smoke-browse.mjs
 */
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
} catch {
  // no .env.local
}

const failures = [];
function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label);
}

/** Ids of every listing card rendered on a page. */
function cardIds(html) {
  return [...html.matchAll(/href="\/tuitions\/([0-9a-f]{24})"/g)].map((m) => m[1]);
}

async function getPage(path) {
  const res = await fetch(`${BASE}${path}`);
  const html = await res.text();
  return { status: res.status, html, ids: cardIds(html) };
}

const uri =
  process.env.MONGODB_URI ?? process.env.MONGODB_URL ?? "mongodb://localhost:27017";
const client = new MongoClient(uri);

let reachable = false;
try {
  const probe = await fetch(`${BASE}/tuitions`).then((r) => r.ok).catch(() => false);
  reachable = probe;
} catch {
  reachable = false;
}
if (!reachable) {
  console.log(`FAIL  server not reachable on ${BASE} (start it first)`);
  process.exit(1);
}

try {
  await client.connect();
  const col = client.db("mentor_lagbe").collection("tuitions");
  const visible = await col
    .find({ approvalStatus: "approved", isActive: true })
    .toArray();
  const hidden = await col
    .find({ $or: [{ approvalStatus: { $ne: "approved" } }, { isActive: { $ne: true } }] })
    .toArray();

  const visibleIds = new Set(visible.map((d) => String(d._id)));
  const hiddenIds = new Set(hidden.map((d) => String(d._id)));
  const hiddenTitles = hidden.map((d) => String(d.title ?? ""));

  // 1. plain browse shows exactly the approved + active set
  const all = await getPage("/tuitions");
  check(
    "lists every approved + active tuition",
    all.ids.length === visibleIds.size && all.ids.every((id) => visibleIds.has(id)),
    `${all.ids.length}/${visibleIds.size} rendered`
  );
  check(
    "never renders a pending/rejected/closed tuition",
    all.ids.every((id) => !hiddenIds.has(id)),
    `${hidden.length} hidden docs exist`
  );
  check("page responds", all.status === 200, `status ${all.status}`);

  // 2. search by keyword
  const target = visible.find((d) => String(d.title ?? "").split(" ").length > 2);
  if (target) {
    const word = String(target.title).split(" ").find((w) => w.length > 4) ?? "";
    const search = await getPage(`/tuitions?q=${encodeURIComponent(word)}`);
    check(
      `search "?q=${word}" narrows the results`,
      search.ids.length > 0 && search.ids.length < visibleIds.size,
      `${search.ids.length}/${visibleIds.size} hits`
    );
    check(
      `search results only contain approved + active posts`,
      search.ids.every((id) => visibleIds.has(id)),
      `${search.ids.length} hits`
    );
  }

  // 3. filters from the dropdowns
  const subject = String(visible[0]?.subject ?? "");
  const classLevel = String(visible[0]?.classLevel ?? "");
  const bySubject = await getPage(`/tuitions?subject=${encodeURIComponent(subject)}`);
  const subjectCount = visible.filter((d) => String(d.subject) === subject).length;
  check(
    `subject filter "${subject}"`,
    bySubject.ids.length === subjectCount && bySubject.ids.length > 0,
    `${bySubject.ids.length}/${subjectCount}`
  );

  const byClass = await getPage(`/tuitions?classLevel=${encodeURIComponent(classLevel)}`);
  const classCount = visible.filter((d) => String(d.classLevel) === classLevel).length;
  check(
    `class level filter "${classLevel}"`,
    byClass.ids.length === classCount && byClass.ids.length > 0,
    `${byClass.ids.length}/${classCount}`
  );

  const byMode = await getPage("/tuitions?mode=Online");
  const onlineCount = visible.filter((d) => String(d.mode) === "Online").length;
  check(
    "mode filter Online",
    byMode.ids.length === onlineCount,
    `${byMode.ids.length}/${onlineCount}`
  );

  const offline = await getPage("/tuitions?mode=Offline");
  const offlineCount = visible.filter((d) => String(d.mode) === "Offline").length;
  check(
    "mode filter Offline",
    offline.ids.length === offlineCount,
    `${offline.ids.length}/${offlineCount} (seed data)`
  );

  // 4. hidden titles never leak into the markup (title text, not just cards)
  const leaked = hiddenTitles.filter((t) => t && all.html.includes(t));
  check("hidden tuition titles absent from the page", leaked.length === 0, leaked.join(", "));

  // 5. the controls are present in the markup
  const controls = [
    ['search bar', 'name="q"'],
    ["subject dropdown", 'name="subject"'],
    ["class level dropdown", 'name="classLevel"'],
    ["mode dropdown", 'name="mode"'],
  ];
  for (const [label, needle] of controls) {
    check(`${label} present`, all.html.includes(needle));
  }
} finally {
  await client.close();
}

console.log(
  failures.length === 0
    ? "BROWSE SMOKE TEST PASSED"
    : `BROWSE SMOKE TEST FAILED: ${failures.join(", ")}`
);
process.exit(failures.length === 0 ? 0 : 1);
