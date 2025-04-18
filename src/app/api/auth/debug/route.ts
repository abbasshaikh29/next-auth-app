import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get the current URL
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  // Construct the expected callback URLs
  const callbackUrls = [
    `${baseUrl}/api/auth/callback/google`,
    `${baseUrl}/api/auth/callback/credentials`
  ];
  
  // Get environment variables
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "Not set";
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ? "Set (hidden)" : "Not set";
  const nextAuthUrl = process.env.NEXTAUTH_URL || "Not set";
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? "Set (hidden)" : "Not set";
  
  // Return debug information
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    baseUrl,
    expectedCallbackUrls: callbackUrls,
    configuredNextAuthUrl: nextAuthUrl,
    googleClientId,
    googleClientIdConfigured: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecretConfigured: !!process.env.GOOGLE_CLIENT_SECRET,
    nextAuthSecretConfigured: !!process.env.NEXTAUTH_SECRET,
    message: "Add these callback URLs to your Google OAuth configuration in Google Cloud Console"
  });
}
