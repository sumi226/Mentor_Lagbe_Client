/**
 * Prints how the tuitions collection breaks down by approval/visibility and
 * lists a few approved+active docs (the set /tuitions is allowed to show).
 * Usage: node scripts/check-browse.mjs
 */
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

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

const uri =
  process.env.MONGODB_URI ?? process.env.MONGODB_URL ?? "mongodb://localhost:27017";

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db("mentor_lagbe").collection("tuitions");

  const total = await col.countDocuments();
  const approvedActive = await col.countDocuments({
    approvalStatus: "approved",
    isActive: true,
  });
  const pending = await col.countDocuments({ approvalStatus: "pending" });
  const rejected = await col.countDocuments({ approvalStatus: "rejected" });
  const approvedButClosed = await col.countDocuments({
    approvalStatus: "approved",
    isActive: { $ne: true },
  });

  const modes = await col.distinct("mode", {
    approvalStatus: "approved",
    isActive: true,
  });
  const subjects = await col
    .distinct("subject", { approvalStatus: "approved", isActive: true })
    .then((s) => s.map(String).sort());
  const classLevels = await col
    .distinct("classLevel", { approvalStatus: "approved", isActive: true })
    .then((s) => s.map(String).sort());

  console.log(
    JSON.stringify(
      { total, approvedActive, pending, rejected, approvedButClosed, modes, subjects, classLevels },
      null,
      2
    )
  );
} finally {
  await client.close();
}
