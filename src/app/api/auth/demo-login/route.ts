import { NextResponse } from "next/server";
import { client, db } from "@/lib/mongodb";
import { auth } from "@/lib/auth";

const DEMO_USERS = {
  admin: {
    email: "admin@mentorlagbe.com",
    name: "Admin Demo",
    password: "DemoPassword123!",
    role: "admin",
    plan: "pro",
  },
  tutor: {
    email: "tutor@mentorlagbe.com",
    name: "Tutor Demo",
    password: "DemoPassword123!",
    role: "tutor",
    plan: "free",
  },
  student: {
    email: "student@mentorlagbe.com",
    name: "Student Demo",
    password: "DemoPassword123!",
    role: "student",
    plan: "free",
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const role = (body.role ?? "student").toLowerCase() as keyof typeof DEMO_USERS;
    const config = DEMO_USERS[role] ?? DEMO_USERS.student;

    await client.connect();
    const existing = await db.collection("users").findOne({ email: config.email });

    if (!existing) {
      // Create user via BetterAuth
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
        console.warn("[demo-login] sign up error or existing:", e);
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
    console.error("[demo-login] failed:", error);
    return NextResponse.json({ error: "Failed to prepare demo login" }, { status: 500 });
  }
}
