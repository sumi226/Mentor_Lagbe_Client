import { auth } from "@/lib/auth";

/**
 * Server-side resolution of the caller behind a protected /api request.
 *
 * Two ways in, in order of preference:
 *   1. `Authorization: Bearer <jwt>` — the token the client fetches from
 *      GET /api/auth/token right after sign-in and sends with every
 *      protected request (see src/lib/api-token.ts). Verified with the
 *      better-auth JWT plugin, so a forged/expired token is rejected.
 *   2. The regular better-auth session cookie, for requests that carry no
 *      bearer token (or when the token has just expired).
 */
export type RequestUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string | null;
  phone?: string | null;
  bio?: string | null;
  plan?: string | null;
};

export type RequestSession = { user: RequestUser } | null;

function readBearer(req: Request): string {
  const header = req.headers.get("authorization") ?? "";
  return /^bearer\s+/i.test(header) ? header.replace(/^bearer\s+/i, "").trim() : "";
}

/** Rebuilds the user object from a verified JWT payload. */
function userFromPayload(payload: Record<string, unknown> | null | undefined): RequestUser | null {
  if (!payload) return null;
  const id = String(payload.sub ?? payload.id ?? "");
  const email = String(payload.email ?? "");
  if (!id || !email) return null;
  return {
    id,
    email,
    name: String(payload.name ?? ""),
    image: (payload.image as string | null | undefined) ?? null,
    role: String(payload.role ?? "student"),
    phone: String(payload.phone ?? ""),
    bio: String(payload.bio ?? ""),
    plan: String(payload.plan ?? "free"),
  };
}

export async function getAuthSession(req: Request): Promise<RequestSession> {
  const bearer = readBearer(req);
  if (bearer) {
    try {
      const result = await auth.api.verifyJWT({
        body: { token: bearer },
        headers: req.headers,
      });
      const user = userFromPayload(result?.payload as Record<string, unknown> | null);
      if (user) return { user };
    } catch (error) {
      console.warn(
        "[api-auth] bearer token rejected:",
        error instanceof Error ? error.message : error
      );
    }
  }

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return null;

  const u = session.user as unknown as Partial<RequestUser> & {
    id: string;
    email: string;
    name: string;
  };
  return {
    user: {
      id: String(u.id),
      email: String(u.email),
      name: String(u.name ?? ""),
      image: u.image ?? null,
      role: u.role ?? "student",
      phone: u.phone ?? "",
      bio: u.bio ?? "",
      plan: u.plan ?? "free",
    },
  };
}
