import { NextResponse } from "next/server";
import { client, db } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

const QUICK_USERS = {
  admin: {
    email: "admin@mentorlagbe.com",
    name: "MentorLagbe Admin",
    password: "MentorLagbe123!",
    role: "admin",
    plan: "pro",
  },
  tutor: {
    email: "tutor@mentorlagbe.com",
    name: "MentorLagbe Tutor",
    password: "MentorLagbe123!",
    role: "tutor",
    plan: "free",
  },
  student: {
    email: "student@mentorlagbe.com",
    name: "MentorLagbe Student",
    password: "MentorLagbe123!",
    role: "student",
    plan: "free",
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const role = (body.role ?? "student").toLowerCase() as keyof typeof QUICK_USERS;
    const config = QUICK_USERS[role] ?? QUICK_USERS.student;

    await client.connect();
    const existing = await db.collection("users").findOne({ email: config.email });

    if (!existing) {
      // Create account via BetterAuth
      try {
        await auth.api.signUpEmail({
          body: {
            name: config.name,
            email: config.email,
            password: config.password,
            role: config.role,
          },
        });
      } catch (e) {
        console.warn("[quick-login] account creation skipped (may already exist):", e);
      }
    }

    // Ensure role and plan are up to date
    await db.collection("users").updateOne(
      { email: config.email },
      { $set: { role: config.role, plan: config.plan } }
    );

    return NextResponse.json({
      ok: true,
      email: config.email,
      password: config.password,
      role: config.role,
    });
  } catch (error) {
    console.error("[quick-login] failed:", error);
    return NextResponse.json({ error: "Failed to prepare login" }, { status: 500 });
  }
}
