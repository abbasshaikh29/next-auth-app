import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import https from "https";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Create a custom HTTPS agent with more permissive TLS settings
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Temporarily disable certificate validation for testing
  secureProtocol: "TLSv1_2_method", // Force TLS 1.2
  ciphers: "HIGH:!aNULL:!MD5", // Allow all high-grade ciphers
});

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestHandler: {
    httpOptions: {
      agent: httpsAgent,
    },
  },
});

async function testR2Connection() {
  try {
    console.log("Testing R2 configuration...");
    console.log("R2_ENDPOINT_URL:", process.env.R2_ENDPOINT_URL);
    console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME);
    console.log("R2_ACCESS_KEY_ID exists:", !!process.env.R2_ACCESS_KEY_ID);
    console.log(
      "R2_SECRET_ACCESS_KEY exists:",
      !!process.env.R2_SECRET_ACCESS_KEY
    );

    console.log("\nAttempting to list buckets...");
    const command = new ListBucketsCommand({});
    const response = await r2Client.send(command);

    console.log("\nSuccessfully connected to R2!");
    console.log(
      "Available buckets:",
      response.Buckets?.map((b) => b.Name).join(", ")
    );

    if (response.Buckets?.some((b) => b.Name === process.env.R2_BUCKET_NAME)) {
      console.log("\n✅ Your configured bucket exists!");
    } else {
      console.log(
        "\n❌ Warning: Your configured bucket was not found in the list of available buckets."
      );
    }
  } catch (error) {
    console.error("\n❌ Error testing R2 connection:", error);
    console.error("\nError details:", error.message);
    if (error.stack) {
      console.error("\nStack trace:", error.stack);
    }
  }
}

testR2Connection();
