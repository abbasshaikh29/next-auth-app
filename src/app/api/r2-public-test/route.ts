import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";

// Create an S3 client configured for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(request: NextRequest) {
  try {
    // Create a unique test file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const testFilePath = `test/public-test-${timestamp}.txt`;
    const testContent = `This is a public test file created at ${timestamp}`;

    console.log(`Creating test file at ${testFilePath}`);

    // Upload the file with public-read ACL
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testFilePath,
      Body: testContent,
      ContentType: "text/plain",
      ACL: "public-read" as ObjectCannedACL, // Type assertion to ObjectCannedACL
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(uploadCommand);

    // Generate the public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${testFilePath}`;

    console.log(`Test file created. Public URL: ${publicUrl}`);

    // Try to fetch the file to verify it's publicly accessible
    let isPubliclyAccessible = false;
    let fetchError = null;
    let fetchResponse = null;

    try {
      console.log(`Fetching test file from ${publicUrl}`);
      const response = await fetch(publicUrl);
      fetchResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };

      if (response.ok) {
        const content = await response.text();
        isPubliclyAccessible = content === testContent;
      }
    } catch (error) {
      console.error("Error fetching test file:", error);
      fetchError = error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      success: true,
      testFilePath,
      publicUrl,
      isPubliclyAccessible,
      fetchResponse,
      fetchError,
      bucketInfo: {
        name: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
      },
    });
  } catch (error) {
    console.error("Error in R2 public test:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
