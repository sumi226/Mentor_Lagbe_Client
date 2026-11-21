import { auth } from "../src/lib/auth.ts";
import { client, db } from "../src/lib/mongodb.ts";

const DEMO_ACCOUNTS = [
  {
    name: "Platform Admin",
    email: "admin@mentorlagbe.com",
    password: "Demo12345!",
    role: "admin",
    plan: "pro",
  },
  {
    name: "Demo Tutor",
    email: "tutor@mentorlagbe.com",
    password: "Demo12345!",
    role: "tutor",
    plan: "free",
  },
  {
    name: "Demo Student",
    email: "student@mentorlagbe.com",
    password: "Demo12345!",
    role: "student",
    plan: "free",
  },
];

async function seed() {
  await client.connect();
  const usersCol = db.collection("users");

  for (const acc of DEMO_ACCOUNTS) {
    const existing = await usersCol.findOne({ email: acc.email });
    if (!existing) {
      console.log(`Creating demo account: ${acc.email} (${acc.role})...`);
      try {
        await auth.api.signUpEmail({
          body: {
            name: acc.name,
            email: acc.email,
            password: acc.password,
            role: acc.role,
          },
        });
        if (acc.plan === "pro") {
          await usersCol.updateOne(
            { email: acc.email },
            { $set: { plan: "pro" } }
          );
        }
        console.log(`Created: ${acc.email}`);
      } catch (err) {
        console.error(`Error creating ${acc.email}:`, err);
      }
    } else {
      console.log(`Account already exists: ${acc.email}`);
      // Ensure correct role and plan
      await usersCol.updateOne(
        { email: acc.email },
        { $set: { role: acc.role, ...(acc.plan === "pro" ? { plan: "pro" } : {}) } }
      );
    }
  }

  console.log("Demo accounts setup complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
