import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client, db } from "@/lib/mongodb";

export type UserRole = "student" | "tutor" | "admin";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  // usePlural → better-auth stores its models in "users", "sessions" and
  // "accounts" collections so the database keeps the 4 app collections
  // (users, tuitions, applications, payments) with the names the app uses.
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
  plugins: [nextCookies()], // required for server actions / route handlers to set cookies
});
