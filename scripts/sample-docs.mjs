/**
 * Prints one sample document per app collection so the stored fields can be
 * checked against the assignment spec.
 * Usage: node scripts/sample-docs.mjs
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

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db("mentor_lagbe");
  for (const name of ["users", "tuitions", "applications", "payments"]) {
    const doc = await db.collection(name).findOne({});
    console.log(`\n=== ${name} ===`);
    if (!doc) {
      console.log("(empty — will be created on first write)");
      continue;
    }
    const fields = Object.keys(doc).filter((key) => key !== "_id");
    console.log(fields.join(", "));
  }
} finally {
  await client.close();
}
