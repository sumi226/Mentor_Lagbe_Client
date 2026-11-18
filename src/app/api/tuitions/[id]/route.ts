import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { client, db } from "@/lib/mongodb";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Tutor management for their own tuition posts:
 *  - PATCH with form fields → edit the listing (keeps its approval status)
 *  - PATCH { action: "toggle-active" } → open/close an approved listing
 *  - DELETE → remove the listing and its student applications
 * Ownership is enforced server-side via the tuition's tutorEmail.
 */
export async function PATCH(req: Request, { params }: RouteContext) {
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
        { error: "forbidden", message: "Only tutor accounts can manage tuition posts." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "invalid-id", message: "Invalid tuition listing." },
        { status: 400 }
      );
    }

    await client.connect();
    const tuitions = db.collection("tuitions");
    const tuition = await tuitions.findOne({ _id: new ObjectId(id) });
    if (!tuition) {
      return NextResponse.json(
        { error: "not-found", message: "Tuition post not found." },
        { status: 404 }
      );
    }
    if (String(tuition.tutorEmail) !== String(user.email)) {
      return NextResponse.json(
        { error: "forbidden", message: "You can only manage your own tuition posts." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));

    // Open / close an approved listing on the browse page.
    if (body.action === "toggle-active") {
      if (String(tuition.approvalStatus) !== "approved") {
        return NextResponse.json(
          {
            error: "not-approved",
            message: "Only approved listings can be opened or closed.",
          },
          { status: 409 }
        );
      }
      const next = !Boolean(tuition.isActive);
      await tuitions.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: next } }
      );
      return NextResponse.json({ ok: true, isActive: next });
    }

    // Edit the listing details.
    const title = String(body.title ?? "").trim().slice(0, 140);
    const subject = String(body.subject ?? "").trim().slice(0, 80);
    const classLevel = String(body.classLevel ?? "").trim().slice(0, 80);
    const mode = body.mode === "Offline" ? "Offline" : "Online";
    const location = String(body.location ?? "").trim().slice(0, 120);
    const description = String(body.description ?? "").trim().slice(0, 2000);
    const monthlyFee = Math.max(0, Math.round(Number(body.monthlyFee) || 0));
    const daysPerWeek = Math.min(
      7,
      Math.max(1, Math.round(Number(body.daysPerWeek) || 3))
    );

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

    await tuitions.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          subject,
          classLevel,
          mode,
          location: location || (mode === "Online" ? "Online" : ""),
          monthlyFee,
          daysPerWeek,
          description,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tuitions] failed to update:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not update the tuition post." },
      { status: 500 }
    );
  }
}

/** Deletes an own tuition post together with its student applications. */
export async function DELETE(req: Request, { params }: RouteContext) {
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
        { error: "forbidden", message: "Only tutor accounts can manage tuition posts." },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "invalid-id", message: "Invalid tuition listing." },
        { status: 400 }
      );
    }

    await client.connect();
    const tuitions = db.collection("tuitions");
    const tuition = await tuitions.findOne({ _id: new ObjectId(id) });
    if (!tuition) {
      return NextResponse.json(
        { error: "not-found", message: "Tuition post not found." },
        { status: 404 }
      );
    }
    if (String(tuition.tutorEmail) !== String(user.email)) {
      return NextResponse.json(
        { error: "forbidden", message: "You can only manage your own tuition posts." },
        { status: 403 }
      );
    }

    await tuitions.deleteOne({ _id: new ObjectId(id) });
    await db.collection("applications").deleteMany({ tuitionId: id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[tuitions] failed to delete:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not delete the tuition post." },
      { status: 500 }
    );
  }
}
