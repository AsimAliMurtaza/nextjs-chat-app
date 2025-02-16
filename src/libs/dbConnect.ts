import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define an interface for caching
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Use globalThis for better compatibility in Next.js
const globalWithMongoose = globalThis as unknown as {
  mongoose?: MongooseCache;
};

// Ensure a single global connection cache
const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI || "", opts)
      .then((mongoose) => mongoose)
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        cached.promise = null; // Reset on failure
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    throw error;
  }

  return cached.conn;
}

// Store the connection cache globally to persist across hot reloads
globalWithMongoose.mongoose = cached;

export default dbConnect;
