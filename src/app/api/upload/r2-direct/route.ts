import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "@/lib/auth-helpers";
import { v4 as uuidv4 } from "uuid";
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

// POST /api/upload/r2-direct - Upload a file directly to R2 from the server
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "profile";
    const communityId = formData.get("communityId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine the folder path based on the upload type
    let folder = "uploads";

    if (type === "profile") {
      folder = `profiles/${session.user.id}`;
    } else if (type === "community" && communityId) {
      folder = `communities/${communityId}`;
    } else if (type === "community-banner") {
      folder = communityId
        ? `communities/${communityId}/banners`
        : "communities/banners";
    } else if (type === "community-icon") {
      folder = communityId
        ? `communities/${communityId}/icons`
        : "communities/icons";
    } else if (type === "post-image") {
      folder = communityId
        ? `communities/${communityId}/posts/images`
        : `posts/images/${session.user.id}`;
    } else if (type === "message-image") {
      folder = `messages/images/${session.user.id}`;
    }

    // Create a unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Uploading file to R2: ${key} (${file.type})`);

    // Upload to R2
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read", // This is crucial for public access
      });

      await r2Client.send(command);
      console.log("File uploaded successfully to R2");
    } catch (uploadError: any) {
      console.error("Error uploading to R2:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const fileUrl = getPublicUrl(key);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      key,
      fileName: file.name,
      fileType: file.type,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        message: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
