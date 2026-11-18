import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI ??
  process.env.MONGODB_URL ??
  "mongodb://localhost:27017";

/**
 * Reuse a single client across dev HMR reloads so we never open a new
 * connection pool per edit (Atlas has a finite connection limit).
 * The MongoClient constructor is lazy — connections open on first operation.
 */
const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
};

export const client = globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
}

export const db = client.db("mentor_lagbe");
