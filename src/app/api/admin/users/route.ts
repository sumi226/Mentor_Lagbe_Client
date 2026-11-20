import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { getAuthSession } from "@/lib/api-auth";
import { client, db } from "@/lib/mongodb";

const ROLES = ["student", "tutor", "admin"] as const;

/**
 * Admin-only: changes a user's role (student / tutor / admin).
 * Admins cannot change their own role to avoid locking themselves out.
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
    const role = String(body.role ?? "");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "invalid-id", message: "Invalid user." },
        { status: 400 }
      );
    }
    if (!(ROLES as readonly string[]).includes(role)) {
      return NextResponse.json(
        { error: "invalid-role", message: "Role must be student, tutor or admin." },
        { status: 400 }
      );
    }
    if (String(user.id) === id) {
      return NextResponse.json(
        { error: "self-change", message: "You cannot change your own role." },
        { status: 400 }
      );
    }

    await client.connect();
    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { role, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "not-found", message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error("[admin] failed to change role:", error);
    return NextResponse.json(
      { error: "server-error", message: "Could not change the user's role." },
      { status: 500 }
    );
  }
}
