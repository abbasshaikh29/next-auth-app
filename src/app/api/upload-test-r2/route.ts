import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
    // Create a simple text file to upload
    const testContent = `This is a test file uploaded at ${new Date().toISOString()}`;
    const testFilePath = "test/r2-test-file.txt";
    
    // Upload the file to R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testFilePath,
      Body: testContent,
      ContentType: "text/plain",
      // Make the file publicly accessible
      ACL: "public-read",
    };
    
    console.log("Uploading test file to R2:", {
      bucket: process.env.R2_BUCKET_NAME,
      key: testFilePath,
      endpoint: process.env.R2_ENDPOINT_URL,
    });
    
    const uploadCommand = new PutObjectCommand(uploadParams);
    const uploadResult = await s3Client.send(uploadCommand);
    
    console.log("Upload result:", uploadResult);
    
    // Generate the public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${testFilePath}`;
    
    return NextResponse.json({
      success: true,
      message: "Test file uploaded successfully",
      publicUrl,
      uploadResult,
      // Include environment variables for debugging (excluding secrets)
      env: {
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
        R2_ENDPOINT_URL: process.env.R2_ENDPOINT_URL?.replace(/\/\/.*@/, "//[REDACTED]@"),
        NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
      },
    });
  } catch (error) {
    console.error("Error uploading test file to R2:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
