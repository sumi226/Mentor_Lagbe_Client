import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAuthSession } from "@/lib/api-auth";
import { client, db } from "@/lib/mongodb";

/**
 * Admin-only: approve or reject any tuition listing.
 * Approving makes the listing live (isActive: true) on /tuitions.
 */
export async function POST(req: Request) {
  try {
    const session = await getAuthSession(req);
    const user = session?.user;
    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Please sign in first." },
        { status: 401 }
      );
    }
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "forbidden", message: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const id = String(body.id ?? "");
    const action = body.action === "reject" ? "reject" : "approve";

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "invalid-id", message: "Invalid tuition listing." },
        { status: 400 }
      );
    }

    await client.connect();
    const update =
      action === "approve"
        ? { approvalStatus: "approved", isActive: true, updatedAt: new Date() }
        : { approvalStatus: "rejected", isActive: false, updatedAt: new Date() };

    const result = await db
      .collection("tuitions")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "not-found", message: "Tuition listing not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, action });
  } catch (error) {
    console.error("[admin] failed to update tuition:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not update the listing." },
      { status: 500 }
    );
  }
}
