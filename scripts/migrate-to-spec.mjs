/**
 * One-off migration to the assignment's 4-collection layout:
 *   users, tuitions, applications, payments
 *
 * 1. Renames better-auth's collections to the plural names the app now uses
 *    (user → users, session → sessions, account → accounts,
 *    verification → verifications). Rename keeps all documents intact, so
 *    existing logins/sessions keep working.
 * 2. Backfills the new spec fields on documents created before this change:
 *    - users:            plan ("free"), phone (""), bio ("")
 *    - applications:     studentPhone (from legacy "phone"), tutorEmail
 *                        (from the tuition post), preferredSchedule ("")
 *    - payments:         userName, transactionId (from stripeSessionId),
 *                        paymentDate (from paidAt/createdAt)
 *
 * Safe to re-run: every step skips documents that already have the field.
 * Usage: node scripts/migrate-to-spec.mjs
 */
import { readFileSync } from "node:fs";
import { MongoClient, ObjectId } from "mongodb";

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

const RENAMES = [
  ["user", "users"],
  ["session", "sessions"],
  ["account", "accounts"],
  ["verification", "verifications"],
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("mentor_lagbe");
  let names = (await db.listCollections().toArray()).map((c) => c.name);

  // ---- 1. rename better-auth collections to plural ------------------------
  for (const [from, to] of RENAMES) {
    if (names.includes(from) && !names.includes(to)) {
      await db.collection(from).rename(to);
      console.log(`renamed: ${from} -> ${to}`);
      names = names.filter((n) => n !== from).concat(to);
    } else if (names.includes(from) && names.includes(to)) {
      console.log(`skipped: ${from} -> ${to} (target already exists)`);
    }
  }

  // ---- 2. users: plan / phone / bio defaults ------------------------------
  const users = db.collection("users");
  if (names.includes("users")) {
    const plan = await users.updateMany(
      { plan: { $exists: false } },
      { $set: { plan: "free" } }
    );
    const contact = await users.updateMany(
      { $or: [{ phone: { $exists: false } }, { bio: { $exists: false } }] },
      { $set: { phone: "", bio: "" } }
    );
    console.log(
      `users: plan defaulted on ${plan.modifiedCount}, phone/bio defaulted on ${contact.modifiedCount}`
    );
  }

  // ---- 3. applications: studentPhone / tutorEmail / preferredSchedule -----
  const applications = db.collection("applications");
  if (names.includes("applications")) {
    // legacy field name was "phone"
    const withLegacyPhone = await applications
      .find({ studentPhone: { $exists: false }, phone: { $exists: true } })
      .toArray();
    for (const doc of withLegacyPhone) {
      await applications.updateOne(
        { _id: doc._id },
        { $set: { studentPhone: String(doc.phone ?? "") } }
      );
    }

    // tutorEmail is denormalised from the tuition post
    const missingTutor = await applications
      .find({ tutorEmail: { $exists: false } })
      .toArray();
    for (const doc of missingTutor) {
      const tuitionId = String(doc.tuitionId ?? "");
      let tutorEmail = "";
      if (ObjectId.isValid(tuitionId)) {
        const tuition = await db
          .collection("tuitions")
          .findOne({ _id: new ObjectId(tuitionId) }, { projection: { tutorEmail: 1 } });
        tutorEmail = String(tuition?.tutorEmail ?? "");
      }
      await applications.updateOne(
        { _id: doc._id },
        { $set: { tutorEmail } }
      );
    }

    const schedule = await applications.updateMany(
      { preferredSchedule: { $exists: false } },
      { $set: { preferredSchedule: "" } }
    );
    const phone = await applications.updateMany(
      { studentPhone: { $exists: false } },
      { $set: { studentPhone: "" } }
    );
    // drop the legacy duplicate once studentPhone holds the value
    const legacy = await applications.updateMany(
      { phone: { $exists: true }, studentPhone: { $exists: true } },
      { $unset: { phone: 1 } }
    );
    console.log(
      `applications: preferredSchedule defaulted on ${schedule.modifiedCount}, studentPhone filled on ${withLegacyPhone.length + phone.modifiedCount}, tutorEmail filled on ${missingTutor.length}, legacy phone removed on ${legacy.modifiedCount}`
    );
  }

  // ---- 4. payments: userName / transactionId / paymentDate ---------------
  const payments = db.collection("payments");
  if (names.includes("payments")) {
    const tx = await payments.updateMany(
      { transactionId: { $exists: false }, stripeSessionId: { $exists: true } },
      [{ $set: { transactionId: "$stripeSessionId" } }]
    );
    const date = await payments.updateMany(
      { paymentDate: { $exists: false } },
      [{ $set: { paymentDate: { $ifNull: ["$paidAt", "$createdAt"] } } }]
    );

    const missingName = await payments
      .find({ userName: { $exists: false } })
      .toArray();
    for (const doc of missingName) {
      const email = String(doc.userEmail ?? "");
      const user = email ? await users.findOne({ email }) : null;
      await payments.updateOne(
        { _id: doc._id },
        { $set: { userName: String(user?.name ?? "") } }
      );
    }
    console.log(
      `payments: transactionId filled on ${tx.modifiedCount}, paymentDate filled on ${date.modifiedCount}, userName filled on ${missingName.length}`
    );
  }

  // ---- 5. final report ----------------------------------------------------
  console.log("\ncollection".padEnd(20) + "documents");
  const finalNames = (await db.listCollections().toArray())
    .map((c) => c.name)
    .sort();
  for (const name of finalNames) {
    const count = await db.collection(name).countDocuments();
    console.log(name.padEnd(20) + count);
  }
} finally {
  await client.close();
}
