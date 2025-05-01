import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET || "";

export async function GET() {
  try {
    // Create a simple text content
    const testContent = "This is a test file for S3 upload";
    const testBuffer = Buffer.from(testContent);

    // Generate a unique key for the test file
    const timestamp = Date.now();
    const key = `test/test-file-${timestamp}.txt`;

    // Upload parameters with public-read ACL
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: testBuffer,
      ContentType: "text/plain",
      ACL: "public-read", // Make the object publicly readable
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(params));

    // Generate the URL
    let url;
    if (process.env.CLOUDFRONT_DOMAIN) {
      url = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
    } else if (process.env.NEXT_PUBLIC_S3_URL) {
      url = `${process.env.NEXT_PUBLIC_S3_URL}/${key}`;
    } else {
      url = `https://${bucketName}.s3.${
        process.env.AWS_REGION || "ap-southeast-1"
      }.amazonaws.com/${key}`;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Test file uploaded successfully",
      url: url,
      config: {
        region: process.env.AWS_REGION,
        bucket: bucketName,
        publicUrl: process.env.NEXT_PUBLIC_S3_URL || "Not configured",
      },
    });
  } catch (error: any) {
    console.error("Error in S3 test:", error);

    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: "S3 test failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
