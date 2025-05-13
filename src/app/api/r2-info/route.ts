import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

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
    // Get bucket information
    const bucketInfo = {
      name: process.env.R2_BUCKET_NAME,
      endpoint: process.env.R2_ENDPOINT_URL?.replace(/\/\/.*@/, "//[REDACTED]@"),
      publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
    };
    
    // List objects in the bucket (limited to 10)
    const listParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 10,
    };
    
    const listCommand = new ListObjectsV2Command(listParams);
    const listResult = await s3Client.send(listCommand);
    
    // Format the objects
    const objects = listResult.Contents?.map(obj => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${obj.Key}`,
    })) || [];
    
    // Upload a test file
    const testContent = `This is a test file uploaded at ${new Date().toISOString()}`;
    const testFilePath = "test/r2-info-test-file.txt";
    
    // Try to fetch a few objects to check if they're publicly accessible
    const objectsToCheck = objects.slice(0, 3);
    const accessResults = await Promise.all(
      objectsToCheck.map(async (obj) => {
        try {
          const response = await fetch(obj.publicUrl);
          return {
            key: obj.key,
            publicUrl: obj.publicUrl,
            accessible: response.ok,
            status: response.status,
            statusText: response.statusText,
          };
        } catch (error) {
          return {
            key: obj.key,
            publicUrl: obj.publicUrl,
            accessible: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      bucketInfo,
      objects,
      accessResults,
    });
  } catch (error) {
    console.error("Error getting R2 info:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
