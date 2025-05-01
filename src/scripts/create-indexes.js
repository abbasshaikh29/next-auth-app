// Script to create MongoDB indexes for better performance
import mongoose from "mongoose";
import dotenv from "dotenv";

// Initialize dotenv
dotenv.config();

async function createIndexes() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the database connection
    const db = mongoose.connection;

    // Create indexes for the Community collection
    console.log("Creating indexes for Community collection...");
    await db
      .collection("communities")
      .createIndex({ slug: 1 }, { unique: true });
    await db.collection("communities").createIndex({ members: 1 });
    await db.collection("communities").createIndex({ admin: 1 });
    await db.collection("communities").createIndex({ subAdmins: 1 });
    console.log("Community indexes created");

    // Create indexes for the User collection
    console.log("Creating indexes for User collection...");
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    console.log("User indexes created");

    // Create indexes for the Post collection
    console.log("Creating indexes for Post collection...");
    await db.collection("posts").createIndex({ communityId: 1, createdAt: -1 });
    await db.collection("posts").createIndex({ createdBy: 1 });
    console.log("Post indexes created");

    // Create indexes for the Comment collection
    console.log("Creating indexes for Comment collection...");
    await db.collection("comments").createIndex({ postId: 1, createdAt: -1 });
    await db.collection("comments").createIndex({ author: 1 });
    console.log("Comment indexes created");

    console.log("All indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
createIndexes();
