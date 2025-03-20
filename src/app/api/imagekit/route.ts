import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import type { UploadResponse } from "imagekit/dist/libs/interfaces";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  // Verify request method
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  try {
    // Remove unnecessary body parsing
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;
    const fileName = formData.get("fileName") as string;

    // Validate required fields
    if (!file || !fileType || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedFileTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    try {
      // Convert File to Buffer
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      // Upload file to ImageKit
      const uploadResponse = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: "/community-banners",
        useUniqueFileName: true,
        tags: ["community-banner"],
      });

      if (!uploadResponse || typeof uploadResponse !== "object") {
        throw new Error("Upload failed - invalid response");
      }

      const { url, fileId, name } = uploadResponse as {
        url: string;
        fileId: string;
        name: string;
      };

      if (!url || !fileId || !name) {
        throw new Error("Upload failed - incomplete response");
      }

      return NextResponse.json({
        url,
        fileId,
        fileType: file.type,
        fileName: name,
      });
    } catch (error) {
      console.error("ImageKit upload error:", error);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
