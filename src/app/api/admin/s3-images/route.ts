import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getPublicUrl } from "@/lib/s3";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.AWS_S3_BUCKET || "";

// GET /api/admin/s3-images - List images from S3 bucket
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check here when user roles are implemented
    // For now, we'll allow any authenticated user to access this endpoint

    // Get the folder from query parameters
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "";

    // Create the command to list objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folder ? `${folder}/` : "",
      MaxKeys: 1000, // Limit to 1000 objects per request
    });

    // Execute the command
    const response = await s3Client.send(command);

    // Transform the response into a more usable format
    const images = (response.Contents || []).map((item) => {
      return {
        key: item.Key || "",
        url: getPublicUrl(item.Key || ""),
        lastModified: item.LastModified?.toISOString(),
        size: item.Size,
      };
    });

    // Return the images
    return NextResponse.json({
      images,
      folder,
      count: images.length,
    });
  } catch (error: any) {
    console.error("Error listing S3 images:", error);
    return NextResponse.json(
      {
        error: "Failed to list images",
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
