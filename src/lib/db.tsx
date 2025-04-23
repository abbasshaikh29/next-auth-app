import mongoose from "mongoose";

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

const isDevelopment = process.env.NODE_ENV === "development";

if (!MONGODB_URI) {
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
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    try {
      cached.promise = mongoose
        .connect(MONGODB_URI!, opts)
        .then(() => {
          // Connection successful
          return mongoose.connection;
        })
        .catch((error) => {
          // Error handling
          cached.promise = null;
          throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        });
    } catch (error: any) {
      // Error in mongoose.connect
      cached.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Error resolving MongoDB connection
    cached.promise = null;
    throw new Error(`Failed to resolve MongoDB connection: ${error}`);
  }

  return cached.conn;
}
