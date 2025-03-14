import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    const filename =
      req.nextUrl.searchParams.get("filename") || `upload-${Date.now()}`;
    const filetype = req.nextUrl.searchParams.get("filetype") || "image/*";

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `uploads/${filename}`,
        ContentType: filetype,
      }),
      { expiresIn: 60 } // 60 seconds
    );

    return new Response(JSON.stringify({ url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("S3 upload error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate upload URL" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
