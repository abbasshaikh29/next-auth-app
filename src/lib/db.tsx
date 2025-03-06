import mongoose from "mongoose";
import { buffer } from "node:stream/consumers";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("no uri found");
}
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, pormise: null };
}

export async function dbconnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.pormise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };
    cached.pormise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => console.log("connected to mongo"))
      .then(() => mongoose.connection);
  }
  try {
    cached.conn = await cached.pormise;
  } catch (error) {
    cached.pormise = null;
    throw Error(`check db file: ${error}`);
  }

  return cached.conn;
}
