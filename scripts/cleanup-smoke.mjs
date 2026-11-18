/**
 * Removes the smoke-test artifacts after scripts/smoke-auth.mjs has run:
 *  - drops the stale singular auth collections (user/session/account) that a
 *    pre-migration server re-created — they only ever held the test user
 *  - deletes the throwaway smoke user (and its sessions/accounts) from the
 *    plural collections
 * Usage: node scripts/cleanup-smoke.mjs
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
  process.env.MONGODB_URI ??
  process.env.MONGODB_URL ??
  "mongodb://localhost:27017";

const SMOKE_EMAIL = "spec-smoke-test@example.com";
const STALE = ["user", "session", "account"];

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("mentor_lagbe");

  // 1. stale singular collections left behind by the pre-migration server
  const existing = (await db.listCollections().toArray()).map((c) => c.name);
  for (const name of STALE) {
    if (existing.includes(name)) {
      const count = await db.collection(name).countDocuments();
      await db.collection(name).drop();
      console.log(`dropped stale collection: ${name} (${count} doc(s))`);
    }
  }

  // 2. the smoke user in the plural collections
  const user = await db.collection("users").findOne({ email: SMOKE_EMAIL });
  if (user) {
    const userId = user._id;
    const sessions = await db
      .collection("sessions")
      .deleteMany({ userId });
    const accounts = await db
      .collection("accounts")
      .deleteMany({ userId });
    const deleted = await db.collection("users").deleteOne({ _id: userId });
    console.log(
      `removed smoke user: users=${deleted.deletedCount}, sessions=${sessions.deletedCount}, accounts=${accounts.deletedCount}`
    );
  } else {
    console.log("no smoke user in users collection");
  }

  // 3. final state
  console.log("\ncollection".padEnd(20) + "documents");
  const names = (await db.listCollections().toArray())
    .map((c) => c.name)
    .sort();
  for (const name of names) {
    const count = await db.collection(name).countDocuments();
    console.log(name.padEnd(20) + count);
  }
} finally {
  await client.close();
}
