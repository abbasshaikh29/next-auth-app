// Script to test CORS configuration on R2 bucket
import dotenv from "dotenv";
import fetch from "node-fetch";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import https from "https";
import crypto from "crypto";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Get R2 configuration from environment variables
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2EndpointUrl = process.env.R2_ENDPOINT_URL;
const bucketName = process.env.R2_BUCKET_NAME;

if (
  !r2PublicUrl ||
  !r2AccessKeyId ||
  !r2SecretAccessKey ||
  !r2EndpointUrl ||
  !bucketName
) {
  console.error(
    "Error: One or more required environment variables are missing"
  );
  console.log("Required variables:");
  console.log("- NEXT_PUBLIC_R2_PUBLIC_URL:", !!r2PublicUrl);
  console.log("- R2_ACCESS_KEY_ID:", !!r2AccessKeyId);
  console.log("- R2_SECRET_ACCESS_KEY:", !!r2SecretAccessKey);
  console.log("- R2_ENDPOINT_URL:", !!r2EndpointUrl);
  console.log("- R2_BUCKET_NAME:", !!bucketName);
  process.exit(1);
}

console.log(`Testing CORS configuration for bucket at: ${r2PublicUrl}`);

// Create a custom HTTPS agent with modern TLS settings
const httpsAgent = new https.Agent({
  rejectUnauthorized: true,
  secureProtocol: "TLS_method",
  secureOptions: crypto.constants?.SSL_OP_NO_SSLv3 || 0,
  ciphers:
    "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384",
});

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: r2EndpointUrl,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
  requestHandler: {
    httpOptions: {
      agent: httpsAgent,
    },
  },
});

const testKey = "cors-test/test-file.txt";
const testContent = "This is a test file for CORS verification.";

async function testCorsConfiguration() {
  try {
    console.log("Testing CORS configuration for bucket at:", r2EndpointUrl);

    // Test 1: Upload a file
    console.log("\n1. Testing file upload...");
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      Body: testContent,
      ContentType: "text/plain",
    });

    await r2Client.send(uploadCommand);
    console.log("✅ File upload successful!");

    // Test 2: Download the file using S3 client
    console.log("\n2. Testing file download via S3 client...");
    const downloadCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testKey,
    });

    const response = await r2Client.send(downloadCommand);
    const downloadedContent = await response.Body.transformToString();

    if (downloadedContent === testContent) {
      console.log("✅ File download via S3 client successful!");
    } else {
      console.log("❌ File content mismatch!");
    }

    // Test 3: Test CORS with fetch
    console.log("\n3. Testing CORS with fetch...");
    const publicUrl = `${r2PublicUrl}/${testKey}`;
    console.log("Testing URL:", publicUrl);

    const fetchResponse = await fetch(publicUrl, {
      method: "GET",
      headers: {
        Origin: "http://localhost:3000",
      },
    });

    console.log("Fetch Response Status:", fetchResponse.status);
    console.log("Fetch Response Headers:", fetchResponse.headers);

    // Check for CORS headers
    const corsHeaders = [
      "access-control-allow-origin",
      "access-control-allow-methods",
      "access-control-allow-headers",
      "access-control-expose-headers",
    ];

    const headers = Object.fromEntries(fetchResponse.headers.entries());
    const missingHeaders = corsHeaders.filter(
      (header) => !headers[header] && !headers[header.toLowerCase()]
    );

    if (missingHeaders.length === 0) {
      console.log("✅ All CORS headers are present!");
    } else {
      console.log("❌ Missing CORS headers:", missingHeaders);
    }

    console.log("\nCORS test completed!");
  } catch (error) {
    console.error("\n❌ Error testing CORS configuration:", error);
    console.error("Error details:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
  }
}

testCorsConfiguration();
