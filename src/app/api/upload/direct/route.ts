import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "@/lib/auth-helpers";
import { v4 as uuidv4 } from "uuid";
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

// POST /api/upload/direct - Upload a file directly to S3 from the server
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "profile";
    const communityId = formData.get("communityId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
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
    }

    // Create a unique filename
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Uploading file to S3: ${key} (${file.type})`);

    // Upload to S3
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // Try with ACL first, but it might fail if bucket doesn't allow it
        ACL: "public-read",
      });

      await s3Client.send(command);
      console.log("File uploaded successfully to S3");
    } catch (uploadError: any) {
      console.error("Error uploading to S3 with ACL:", uploadError);

      // If ACL fails, try without it
      if (uploadError.name === "AccessDenied" || uploadError.code === "AccessDenied") {
        console.log("Retrying upload without ACL...");
        const commandWithoutAcl = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        });

        await s3Client.send(commandWithoutAcl);
        console.log("File uploaded successfully to S3 without ACL");
      } else {
        throw uploadError;
      }
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
        details: error.message,
        code: error.code || error.name,
      },
      { status: 500 }
    );
  }
}
