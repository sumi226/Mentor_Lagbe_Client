import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/mongodb";

/**
 * Lets a signed-in tutor post a new tuition batch. The listing is created
 * as approvalStatus "pending" / isActive false and only goes live on the
 * browse page after an admin approves it.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;
    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in first." },
        { status: 401 }
      );
    }
    if (user.role !== "tutor") {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "Only tutor accounts can post tuition batches.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const title = String(body.title ?? "").trim().slice(0, 140);
    const subject = String(body.subject ?? "").trim().slice(0, 80);
    const classLevel = String(body.classLevel ?? "").trim().slice(0, 80);
    const mode = body.mode === "Offline" ? "Offline" : "Online";
    const location = String(body.location ?? "").trim().slice(0, 120);
    const description = String(body.description ?? "").trim().slice(0, 2000);
    const monthlyFee = Math.max(0, Math.round(Number(body.monthlyFee) || 0));
    const daysPerWeek = Math.min(7, Math.max(1, Math.round(Number(body.daysPerWeek) || 3)));

    if (!title || !subject || !classLevel || description.length < 20) {
      return NextResponse.json(
        {
          error: "invalid-input",
          message:
            "Please provide a title, subject, class level and a description (at least 20 characters).",
        },
        { status: 400 }
      );
    }

    await client.connect();

    // Plan rule: a Free tutor may have at most 2 tuition posts (pending and
    // approved both count against the quota); rejected ones don't.
    const planDoc = await db
      .collection("users")
      .findOne({ email: String(user.email ?? "") });
    const plan = String(planDoc?.plan ?? "free");
    if (plan !== "pro") {
      const used = await db.collection("tuitions").countDocuments({
        tutorEmail: String(user.email ?? ""),
        approvalStatus: { $ne: "rejected" },
      });
      if (used >= 2) {
        return NextResponse.json(
          {
            error: "post-limit",
            message:
              "Free tutors can post up to 2 tuitions. Upgrade to Pro Tutor for unlimited posts.",
          },
          { status: 403 }
        );
      }
    }

    const result = await db.collection("tuitions").insertOne({
      title,
      subject,
      classLevel,
      mode,
      location: location || (mode === "Online" ? "Online" : ""),
      monthlyFee,
      daysPerWeek,
      bannerImage: String(body.bannerImage ?? ""),
      description,
      tutorName: String(user.name ?? ""),
      tutorEmail: String(user.email ?? ""),
      tutorAvatar: String(body.tutorAvatar ?? ""),
      approvalStatus: "pending",
      isActive: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, id: String(result.insertedId) });
  } catch (error) {
    console.error("[tuitions] failed to create:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not post the batch. Please try again." },
      { status: 500 }
    );
  }
}
