import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const fileType = req.nextUrl.searchParams.get("fileType") || "image";
    const fileName =
      req.nextUrl.searchParams.get("filename") || `upload-${Date.now()}`;

    const authParams = await fetch(`${process.env.NEXTAUTH_URL}/api/imagekit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType, fileName }),
    }).then((res) => res.json());

    return new Response(JSON.stringify(authParams), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate upload URL" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
