import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAuthSession } from "@/lib/api-auth";
import { client, db } from "@/lib/mongodb";

/**
 * Stores a student's application for a tuition listing.
 * Access is restricted to signed-in users with the "student" role —
 * enforced here on the server, not just in the UI.
 */
export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);
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
    const schedule = String(body.preferredSchedule ?? "").trim().slice(0, 120);
    const note = String(body.studentNote ?? body.message ?? "").trim();

    if (!ObjectId.isValid(tuitionId)) {
      return NextResponse.json(
        { error: "invalid-tuition", message: "Invalid tuition listing." },
        { status: 400 }
      );
    }
    if (!schedule) {
      return NextResponse.json(
        {
          error: "invalid-schedule",
          message: "Please tell the tutor your preferred schedule.",
        },
        { status: 400 }
      );
    }
    if (note.length < 10) {
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

    // Spec fields for the applications collection: tuitionId, tuitionTitle,
    // subject, monthlyFee, tutorEmail, studentName, studentEmail,
    // studentPhone, preferredSchedule, studentNote, status, appliedAt.
    await applications.insertOne({
      tuitionId,
      tuitionTitle: String(tuition.title ?? ""),
      subject: String(tuition.subject ?? ""),
      monthlyFee: Number(tuition.monthlyFee ?? 0),
      tutorName: String(tuition.tutorName ?? ""),
      tutorEmail: String(tuition.tutorEmail ?? ""),
      studentId: user.id,
      studentName: name || String(user.name ?? ""),
      studentEmail: String(user.email ?? ""),
      studentPhone: phone,
      preferredSchedule: schedule,
      studentNote: note,
      status: "pending",
      appliedAt: new Date(),
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

/**
 * Student: cancels their own application while it is still pending.
 * Accepted/rejected applications are final and cannot be removed.
 */
export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession(req);
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in first." },
        { status: 401 }
      );
    }
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "forbidden", message: "Only students can cancel applications." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const id = String(body.id ?? "");
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "invalid-id", message: "Invalid application." },
        { status: 400 }
      );
    }

    await client.connect();
    const applications = db.collection("applications");
    const application = await applications.findOne({ _id: new ObjectId(id) });

    if (!application || String(application.studentId) !== String(user.id)) {
      return NextResponse.json(
        { error: "not-found", message: "Application not found." },
        { status: 404 }
      );
    }
    if (String(application.status) !== "pending") {
      return NextResponse.json(
        {
          error: "not-cancellable",
          message: "Only pending applications can be cancelled.",
        },
        { status: 409 }
      );
    }

    await applications.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[applications] failed to cancel:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not cancel the application." },
      { status: 500 }
    );
  }
}

/**
 * Tutor: accepts or rejects a student application for one of their own
 * tuition posts. Ownership is verified against the tuition's tutorEmail.
 */
export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession(req);
    const user = session?.user;

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in first." },
        { status: 401 }
      );
    }
    if (user.role !== "tutor") {
      return NextResponse.json(
        { error: "forbidden", message: "Only tutors can review applications." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const id = String(body.id ?? "");
    const action = body.action === "reject" ? "reject" : "accept";

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "invalid-id", message: "Invalid application." },
        { status: 400 }
      );
    }

    await client.connect();
    const application = await db
      .collection("applications")
      .findOne({ _id: new ObjectId(id) });
    if (!application) {
      return NextResponse.json(
        { error: "not-found", message: "Application not found." },
        { status: 404 }
      );
    }

    const tuitionId = String(application.tuitionId ?? "");
    const tuition = ObjectId.isValid(tuitionId)
      ? await db
          .collection("tuitions")
          .findOne({ _id: new ObjectId(tuitionId) })
      : null;
    if (!tuition || String(tuition.tutorEmail) !== String(user.email)) {
      return NextResponse.json(
        { error: "forbidden", message: "This application belongs to another tutor." },
        { status: 403 }
      );
    }

    const status = action === "accept" ? "accepted" : "rejected";
    await db
      .collection("applications")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status } });

    return NextResponse.json({ ok: true, action, status });
  } catch (error) {
    console.error("[applications] failed to review:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not update the application." },
      { status: 500 }
    );
  }
}
