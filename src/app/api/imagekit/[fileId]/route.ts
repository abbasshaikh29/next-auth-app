import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

// Initialize ImageKit only if all required environment variables are present
const initImageKit = () => {
  if (
    !process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    !process.env.IMAGEKIT_PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  ) {
    console.error(
      "Missing ImageKit configuration. Please check your environment variables."
    );
    return null;
  }

  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });
};

const imagekit = initImageKit();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  // Check if ImageKit is properly initialized
  if (!imagekit) {
    return NextResponse.json(
      {
        error:
          "ImageKit is not configured properly. Please check server configuration.",
      },
      { status: 500 }
    );
  }

  try {
    const resolvedParams = await context.params;
    const { fileId } = resolvedParams;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get file details from ImageKit
    const fileDetails = await imagekit.getFileDetails(fileId);

    return NextResponse.json(fileDetails);
  } catch (error) {
    console.error("Error getting image details:", error);
    return NextResponse.json(
      { error: "Failed to get image details" },
      { status: 500 }
    );
  }
}
