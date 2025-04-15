import mongoose from "mongoose";

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Log which environment we're in
const isDevelopment = process.env.NODE_ENV === "development";
console.log(`Running in ${isDevelopment ? "development" : "production"} mode`);
console.log(`Using database: ${MONGODB_URI?.split("/").pop()}`);

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
          console.log("Connected to MongoDB successfully");
          console.log(`Database name: ${mongoose.connection.db.databaseName}`);
          return mongoose.connection;
        })
        .catch((error) => {
          console.error("Error connecting to MongoDB:", error);
          console.error(
            "Connection string:",
            MONGODB_URI?.replace(/:[^:]*@/, ":****@")
          );
          cached.promise = null;
          throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        });
    } catch (error: any) {
      console.error("Error in mongoose.connect:", error);
      cached.promise = null;
      throw new Error(`Failed to connect to MongoDB: ${error.message}`);
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
