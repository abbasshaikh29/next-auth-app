import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MongoDB URI is not defined in environment variables");
  throw new Error("MongoDB URI is not defined");
}

// Define a type for our cached connection
type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

// Use a module-level variable instead of global
let cached: MongooseCache = { conn: null, promise: null };

export async function dbconnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI!, opts).then(() => {
        console.log("Connected to MongoDB successfully");
        return mongoose.connection;
      });
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      cached.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error}`);
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("Error resolving MongoDB connection:", error);
    cached.promise = null;
    throw new Error(`Failed to resolve MongoDB connection: ${error}`);
  }

  return cached.conn;
}
