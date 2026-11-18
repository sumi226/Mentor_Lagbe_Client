/**
 * Lists every collection (with document counts) in the mentor_lagbe database.
 * Usage: node scripts/inspect-db.mjs
 */
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

// Minimal .env.local loader (Node doesn't read it on its own).
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
} catch {
  // no .env.local — fall back to defaults below
}

const uri =
  process.env.MONGODB_URI ??
  process.env.MONGODB_URL ??
  "mongodb://localhost:27017";

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("mentor_lagbe");
  const cols = await db.listCollections().toArray();
  const names = cols.map((c) => c.name).sort();
  if (names.length === 0) {
    console.log("mentor_lagbe database is empty — no collections yet.");
  }
  for (const name of names) {
    const count = await db.collection(name).countDocuments();
    console.log(`${name}: ${count} document(s)`);
  }
} finally {
  await client.close();
}
