import mongoose from "mongoose";

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

const isDevelopment = process.env.NODE_ENV === "development";
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

// Only throw an error if we're not in the build phase and MongoDB URI is missing
if (!MONGODB_URI && !isBuildTime) {
  console.warn("MongoDB URI is not defined - database connections will fail");
}

// Define a type for our cached connection
type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

// Use a module-level variable instead of global
let cached: MongooseCache = { conn: null, promise: null };

export async function dbconnect() {
  // If we're in the build phase and no MongoDB URI is available, return a mock connection
  if (isBuildTime && !MONGODB_URI) {
    console.warn(
      "Build phase detected with no MongoDB URI - returning mock connection"
    );
    return {
      readyState: 0,
      models: {},
      on: () => {},
      once: () => {},
    } as unknown as mongoose.Connection;
  }

  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Check for MongoDB URI before attempting connection
  if (!MONGODB_URI) {
    throw new Error("Cannot connect to MongoDB: URI is not defined");
  }

  // Create a new connection if none exists
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
        .connect(MONGODB_URI, opts)
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
