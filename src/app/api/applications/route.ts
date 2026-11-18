import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/mongodb";

/**
 * Stores a student's application for a tuition listing.
 * Access is restricted to signed-in users with the "student" role —
 * enforced here on the server, not just in the UI.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in to apply." },
        { status: 401 }
      );
    }
    if (user.role !== "student") {
      return NextResponse.json(
        {
          error: "forbidden",
          message: "Only student accounts can apply for tuitions.",
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const tuitionId = String(body.tuitionId ?? "");
    const name = String(body.name ?? user.name ?? "").trim();
    const phone = String(body.phone ?? "").trim().slice(0, 30);
    const message = String(body.message ?? "").trim();

    if (!ObjectId.isValid(tuitionId)) {
      return NextResponse.json(
        { error: "invalid-tuition", message: "Invalid tuition listing." },
        { status: 400 }
      );
    }
    if (message.length < 10) {
      return NextResponse.json(
        {
          error: "invalid-message",
          message: "Please write at least 10 characters explaining your interest.",
        },
        { status: 400 }
      );
    }

    await client.connect();
    const tuition = await db.collection("tuitions").findOne({
      _id: new ObjectId(tuitionId),
      approvalStatus: "approved",
      isActive: true,
    });
    if (!tuition) {
      return NextResponse.json(
        { error: "not-found", message: "This tuition listing is no longer available." },
        { status: 404 }
      );
    }

    const applications = db.collection("applications");
    const existing = await applications.findOne({
      tuitionId,
      studentId: user.id,
    });
    if (existing) {
      return NextResponse.json(
        { error: "already-applied", message: "You already applied for this tuition." },
        { status: 409 }
      );
    }

    await applications.insertOne({
      tuitionId,
      tuitionTitle: String(tuition.title ?? ""),
      tutorName: String(tuition.tutorName ?? ""),
      studentId: user.id,
      studentName: name || String(user.name ?? ""),
      studentEmail: String(user.email ?? ""),
      phone,
      message,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[applications] failed to submit:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not submit your application. Please try again." },
      { status: 500 }
    );
  }
}
