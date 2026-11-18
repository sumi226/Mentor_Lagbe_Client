import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  // Same-origin by default; the auth API route handler lives at /api/auth
  plugins: [inferAdditionalFields<typeof auth>()],
});

export type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

export type UserRole = "student" | "tutor" | "admin";
