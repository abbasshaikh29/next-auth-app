import ImageKit from "imagekit";
import { NextResponse } from "next/server";

// Initialize ImageKit only if all required environment variables are present
const initImageKit = () => {
  if (
    !process.env.NEXT_PUBLIC_PUBLIC_KEY ||
    !process.env.PRIVATE_KEY ||
    !process.env.NEXT_PUBLIC_URL_ENDPOINT
  ) {
    console.error(
      "Missing ImageKit configuration. Please check your environment variables."
    );
    return null;
  }

  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT,
  });
};

const imagekit = initImageKit();

export async function GET() {
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
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      {
        status: 500,
      }
    );
  }
}
