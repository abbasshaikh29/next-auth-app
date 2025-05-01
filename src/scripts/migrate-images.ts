/**
 * Script to migrate images from ImageKit to AWS S3
 *
 * This script:
 * 1. Fetches all images from ImageKit
 * 2. Downloads each image
 * 3. Uploads it to S3
 * 4. Updates the database with the new S3 URL
 *
 * Usage:
 * - Run with: npx ts-node src/scripts/migrate-images.ts
 * - Requires AWS and ImageKit credentials in .env
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ImageKit from "imagekit";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { createHash } from "crypto";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY || "",
  privateKey: process.env.PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT || "",
});

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Initialize MongoDB client
const mongoClient = new MongoClient(process.env.MONGODB_URI || "");

// Temporary directory for downloaded images
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Helper function to download an image
async function downloadImage(url: string, filePath: string): Promise<void> {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

// Helper function to upload an image to S3
async function uploadToS3(
  filePath: string,
  key: string,
  contentType: string
): Promise<string> {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET || "",
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));

  // Generate the URL
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${key}`;
  } else if (process.env.NEXT_PUBLIC_S3_URL) {
    return `${process.env.NEXT_PUBLIC_S3_URL}/${key}`;
  } else {
    return `https://${params.Bucket}.s3.${
      process.env.AWS_REGION || "ap-southeast-1"
    }.amazonaws.com/${key}`;
  }
}

// Helper function to update database references
async function updateDatabase(
  collection: string,
  field: string,
  oldUrl: string,
  newUrl: string
): Promise<number> {
  const db = mongoClient.db();
  const result = await db
    .collection(collection)
    .updateMany({ [field]: oldUrl }, { $set: { [field]: newUrl } });
  return result.modifiedCount;
}

// Main migration function
async function migrateImages() {
  try {
    console.log("Starting image migration from ImageKit to S3...");

    // Connect to MongoDB
    await mongoClient.connect();
    console.log("Connected to MongoDB");

    // Get all images from ImageKit
    const images = await imagekit.listFiles({
      skip: 0,
      limit: 1000, // Adjust as needed
    });

    console.log(`Found ${images.length} images in ImageKit`);

    // Process each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`Processing image ${i + 1}/${images.length}: ${image.name}`);

      // Generate a hash of the URL to use as a unique filename
      const urlHash = createHash("md5").update(image.url).digest("hex");
      const tempFilePath = path.join(tempDir, `${urlHash}-${image.name}`);

      try {
        // Download the image
        await downloadImage(image.url, tempFilePath);
        console.log(`  Downloaded to ${tempFilePath}`);

        // Determine the appropriate S3 folder based on file path or tags
        let s3Folder = "migrated";
        if (image.filePath && image.filePath.startsWith("/")) {
          // Use the ImageKit folder structure
          s3Folder = image.filePath.substring(1); // Remove leading slash
        } else if (image.tags && image.tags.length > 0) {
          // Use the first tag as a folder name
          s3Folder = `migrated/${image.tags[0]}`;
        }

        // Upload to S3
        const s3Key = `${s3Folder}/${image.name}`;
        const newUrl = await uploadToS3(tempFilePath, s3Key, image.fileType);
        console.log(`  Uploaded to S3: ${newUrl}`);

        // Update database references
        const collections = [
          { name: "communities", fields: ["bannerImageurl", "iconImageUrl"] },
          { name: "users", fields: ["profileImage"] },
          { name: "posts", fields: ["content"] }, // Note: posts might store image URLs in content JSON
        ];

        let totalUpdates = 0;
        for (const collection of collections) {
          for (const field of collection.fields) {
            const updates = await updateDatabase(
              collection.name,
              field,
              image.url,
              newUrl
            );
            if (updates > 0) {
              console.log(
                `  Updated ${updates} documents in ${collection.name}.${field}`
              );
              totalUpdates += updates;
            }
          }
        }

        // Special handling for post content which might be JSON
        const db = mongoClient.db();
        const postsCollection = db.collection("posts");
        const postsWithImageInContent = await postsCollection
          .find({
            content: { $regex: image.url },
          })
          .toArray();

        for (const post of postsWithImageInContent) {
          try {
            let content = post.content;
            // If content is a JSON string, parse it, update URLs, and stringify again
            if (
              typeof content === "string" &&
              (content.startsWith("{") || content.startsWith("["))
            ) {
              const contentObj = JSON.parse(content);
              const updatedContent = JSON.stringify(contentObj).replace(
                new RegExp(image.url, "g"),
                newUrl
              );
              await postsCollection.updateOne(
                { _id: post._id },
                { $set: { content: updatedContent } }
              );
              console.log(
                `  Updated image URL in post content (JSON) for post ${post._id}`
              );
              totalUpdates++;
            } else if (typeof content === "string") {
              // If content is a plain string, replace the URL directly
              const updatedContent = content.replace(
                new RegExp(image.url, "g"),
                newUrl
              );
              if (updatedContent !== content) {
                await postsCollection.updateOne(
                  { _id: post._id },
                  { $set: { content: updatedContent } }
                );
                console.log(
                  `  Updated image URL in post content (string) for post ${post._id}`
                );
                totalUpdates++;
              }
            }
          } catch (error) {
            console.error(`  Error updating post ${post._id}:`, error);
          }
        }

        console.log(`  Total database updates: ${totalUpdates}`);

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.error(`  Error processing image ${image.name}:`, error);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Clean up
    await mongoClient.close();
    console.log("Closed MongoDB connection");
  }
}

// Run the migration
migrateImages().catch(console.error);
