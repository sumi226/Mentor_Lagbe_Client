import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const client = new MongoClient(
  process.env.MONGODB_URI ?? process.env.MONGODB_URL ?? "mongodb://localhost:27017"
);
const db = client.db("mentor_lagbe");

export type UserRole = "student" | "tutor" | "admin";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: mongodbAdapter(db, { client }),
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
    },
  },
  plugins: [nextCookies()], // required for server actions / route handlers to set cookies
});
