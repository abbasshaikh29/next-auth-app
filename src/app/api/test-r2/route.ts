import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const imageUrl = "https://pub-65971ea78c843b59c97073ccfe523c5.r2.dev/profiles/68224087e539f65ec36b23c1/72af7e5f-178d-4f0d-b238-38bf2be1d843.jpg";
  
  try {
    console.log("Server-side: Fetching image from R2:", imageUrl);
    
    const response = await fetch(imageUrl, {
      headers: {
        "Accept": "image/jpeg, image/png, image/webp, image/*",
      },
    });
    
    const responseInfo = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok,
      url: response.url,
    };
    
    console.log("Server-side: R2 response info:", responseInfo);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
        responseInfo,
      }, { status: 500 });
    }
    
    // Get the image data
    const imageData = await response.arrayBuffer();
    
    // Return the image data with appropriate headers
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Content-Length": response.headers.get("Content-Length") || String(imageData.byteLength),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Server-side: Error fetching image from R2:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
