import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth-client";

export type SessionProfile = SessionUser & {
  id: string;
  role: "student" | "tutor" | "admin";
};

/**
 * Server-side session lookup for pages (uses the incoming request headers).
 * Returns null when signed out — pages should redirect to /sign-in.
 */
export async function getSessionUser(): Promise<SessionProfile | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;
    if (!user) return null;
    const raw = user as unknown as SessionUser & { id?: string };
    return {
      ...raw,
      id: String(raw.id ?? ""),
      role:
        raw.role === "tutor" || raw.role === "admin" ? raw.role : "student",
    };
  } catch {
    return null;
  }
}
