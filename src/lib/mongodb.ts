import { MongoClient } from "mongodb";

const FALLBACK_MONGODB_URI =
  "mongodb+srv://mentor_lagbe:iQylN3NxWvUQtnmZ@cluster0.packzgp.mongodb.net/?compressors=zlib";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (uri && !uri.includes("localhost")) {
    return uri;
  }
  if (process.env.NODE_ENV === "production") {
    return FALLBACK_MONGODB_URI;
  }
  return uri || "mongodb://localhost:27017";
}

/**
 * Reuse a single client across serverless invocations and dev HMR reloads
 * to prevent exhausting connection limits on MongoDB Atlas.
 */
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
};

if (!globalForMongo._mongoClient) {
  globalForMongo._mongoClient = new MongoClient(getMongoUri(), {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
  });
}

export const client = globalForMongo._mongoClient;

export const db = client.db("mentor_lagbe");
