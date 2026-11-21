import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client, db } from "@/lib/mongodb";

export type UserRole = "student" | "tutor" | "admin";

/**
 * Resolve the canonical URL for better-auth.
 * Priority: explicit BETTER_AUTH_URL (production) > Vercel's auto-injected URLs > production fallback > localhost.
 * VERCEL_URL does NOT include the scheme, so we prepend "https://".
 */
function resolveBaseURL(): string {
  if (
    process.env.BETTER_AUTH_URL &&
    !process.env.BETTER_AUTH_URL.includes("localhost")
  ) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://mentor-lagbe-client-nine.vercel.app";
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export const auth = betterAuth({
  baseURL: resolveBaseURL(),
  // Allow all Vercel deployment domains, custom domains, and local origins
  trustedOrigins: async (request) => {
    const origin = request?.headers?.get("origin");
    const referer = request?.headers?.get("referer");
    let refererOrigin: string | undefined;
    if (referer) {
      try {
        refererOrigin = new URL(referer).origin;
      } catch {}
    }

    const origins: (string | undefined | null)[] = [
      "https://mentor-lagbe-client-nine.vercel.app",
      "https://*.vercel.app",
      "*.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
      process.env.BETTER_AUTH_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined,
      origin,
      refererOrigin,
    ];

    return origins.filter(Boolean) as string[];
  },
  advanced: {
    trustedProxyHeaders: true,
  },
  // usePlural → better-auth stores its models in "users", "sessions" and
  // "accounts" collections so the database keeps the 4 app collections
  // (users, tuitions, applications, payments) with the names the app uses.
  // Auth-internal storage (sessions/accounts/verifications/jwks) sits next
  // to them and never touches the app's data model.
  database: mongodbAdapter(db, { client, usePlural: true }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "student",
        input: true, // allow choosing the role at sign-up
      },
      phone: {
        type: "string",
        defaultValue: "",
        input: true, // editable from the profile page
      },
      bio: {
        type: "string",
        defaultValue: "",
        input: true, // editable from the profile page
      },
      plan: {
        type: "string",
        defaultValue: "free", // free | pro — only the server upgrades it
        input: false,
      },
    },
  },
  // better-auth's core "image" field has no default, so documents created
  // without an avatar would miss it entirely — store an explicit null instead.
  databaseHooks: {
    user: {
      create: {
        before: async (data) => ({
          data: { ...data, image: data.image ?? null },
        }),
      },
    },
  },
  plugins: [
    // JWT integration: the client fetches GET /api/auth/token right after
    // sign-in / sign-up and sends the token as `Authorization: Bearer …` on
    // protected /api requests, where the API routes verify it (see
    // src/lib/api-auth.ts). Signing keys are kept in better-auth's own
    // key-store collection — auth-internal storage that sits next to
    // sessions/accounts/verifications (the adapter pluralises model names,
    // so the plugin's "jwks" model shows up as "jwkss").
    jwt({
      jwt: { expirationTime: "15m" },
    }),
    // required for server actions / route handlers to set cookies
    nextCookies(),
  ],
});
