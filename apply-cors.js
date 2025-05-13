// Script to apply CORS configuration to R2 bucket
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from "dotenv";
import https from "https";
import crypto from "crypto";

// Initialize dotenv
dotenv.config({ path: ".env.local" });

// Log environment variables (without sensitive data)
console.log("Environment variables:");
console.log("R2_ENDPOINT_URL:", process.env.R2_ENDPOINT_URL);
console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME);
console.log("R2_ACCESS_KEY_ID exists:", !!process.env.R2_ACCESS_KEY_ID);
console.log("R2_SECRET_ACCESS_KEY exists:", !!process.env.R2_SECRET_ACCESS_KEY);

// Read CORS configuration from file
console.log("Reading CORS configuration from file...");
const corsConfig = JSON.parse(fs.readFileSync("./cors-config.json", "utf8"));
console.log("CORS configuration:", JSON.stringify(corsConfig, null, 2));

// Create a custom HTTPS agent with modern TLS settings
const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
  secureProtocol: "TLS_method",
  secureOptions: crypto.constants?.SSL_OP_NO_SSLv3 || 0,
  ciphers:
    "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384",
});

// Configure S3 client for R2 with custom HTTPS agent
console.log("Configuring S3 client for R2 with custom HTTPS agent...");
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for Cloudflare R2
  requestHandler: {
    httpOptions: {
      agent: httpsAgent,
    },
  },
});

async function applyCorsConfiguration() {
  try {
    console.log("Creating PutBucketCorsCommand...");
    const command = new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CORSConfiguration: corsConfig,
    });

    console.log("Sending command to R2...");
    const response = await s3Client.send(command);
    console.log("CORS configuration applied successfully!");
    console.log("Response:", response);
  } catch (error) {
    console.error("Error applying CORS configuration:", error);
    console.error("Error details:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

applyCorsConfiguration();
