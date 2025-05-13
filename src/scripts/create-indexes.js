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

    // Helper function to safely create an index
    async function safeCreateIndex(collection, keys, options) {
      try {
        await db.collection(collection).createIndex(keys, options);
        console.log(
          `Index created for ${collection} on ${JSON.stringify(keys)}`
        );
      } catch (error) {
        if (error.code === 86) {
          // IndexKeySpecsConflict
          console.log(
            `Index already exists for ${collection} on ${JSON.stringify(keys)}`
          );
        } else {
          console.error(
            `Error creating index for ${collection}:`,
            error.message
          );
        }
      }
    }

    // Create indexes for the Community collection
    console.log("Creating indexes for Community collection...");
    await safeCreateIndex(
      "communities",
      { slug: 1 },
      { unique: true, sparse: true }
    );
    await safeCreateIndex("communities", { members: 1 }, {});
    await safeCreateIndex("communities", { admin: 1 }, {});
    await safeCreateIndex("communities", { subAdmins: 1 }, {});
    console.log("Community indexes created");

    // Create indexes for the User collection
    console.log("Creating indexes for User collection...");
    await safeCreateIndex("users", { email: 1 }, { unique: true });
    await safeCreateIndex("users", { username: 1 }, { unique: true });
    console.log("User indexes created");

    // Create indexes for the Post collection
    console.log("Creating indexes for Post collection...");
    await safeCreateIndex("posts", { communityId: 1, createdAt: -1 }, {});
    await safeCreateIndex("posts", { createdBy: 1 }, {});
    console.log("Post indexes created");

    // Create indexes for the Comment collection
    console.log("Creating indexes for Comment collection...");
    await safeCreateIndex("comments", { postId: 1, createdAt: -1 }, {});
    await safeCreateIndex("comments", { author: 1 }, {});
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
