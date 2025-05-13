import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getPublicUrl } from "@/lib/r2";
import https from "https";
import crypto from "crypto";

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
  region: "auto", // R2 uses 'auto' for region
  endpoint: process.env.R2_ENDPOINT_URL || "", // Cloudflare R2 endpoint
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  requestHandler: {
    httpOptions: {
      agent: httpsAgent,
    },
  },
});

const bucketName = process.env.R2_BUCKET_NAME || "";

// GET /api/admin/r2-images - List images from R2 bucket
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
    const maxKeys = parseInt(searchParams.get("maxKeys") || "100");
    const continuationToken =
      searchParams.get("continuationToken") || undefined;

    // Create the command to list objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folder ? `${folder}/` : "",
      MaxKeys: maxKeys, // Limit to 100 objects per request by default
      ContinuationToken: continuationToken,
    });

    // Execute the command
    const response = await r2Client.send(command);

    // Transform the response into a more usable format
    const images = (response.Contents || []).map((item) => {
      return {
        key: item.Key || "",
        url: getPublicUrl(item.Key || ""),
        lastModified: item.LastModified?.toISOString(),
        size: item.Size,
      };
    });

    // Return the images with pagination info
    return NextResponse.json({
      images,
      folder,
      count: images.length,
      isTruncated: response.IsTruncated,
      nextContinuationToken: response.NextContinuationToken,
    });
  } catch (error: any) {
    console.error("Error listing R2 images:", error);
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
