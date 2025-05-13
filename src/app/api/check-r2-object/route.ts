import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadObjectCommand, GetObjectAclCommand } from "@aws-sdk/client-s3";

// Create an S3 client configured for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function GET(request: NextRequest) {
  // Get the object key from the query parameters
  const searchParams = request.nextUrl.searchParams;
  const objectKey = searchParams.get("key");
  
  if (!objectKey) {
    return NextResponse.json({
      success: false,
      error: "Missing 'key' parameter",
    }, { status: 400 });
  }
  
  try {
    console.log(`Checking R2 object: ${objectKey}`);
    
    // Check if the object exists
    const headParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: objectKey,
    };
    
    try {
      const headCommand = new HeadObjectCommand(headParams);
      const headResult = await s3Client.send(headCommand);
      
      console.log("Object exists:", {
        contentType: headResult.ContentType,
        contentLength: headResult.ContentLength,
        lastModified: headResult.LastModified,
      });
      
      // Try to get the object's ACL
      // Note: R2 might not support GetObjectAcl, so this might fail
      let aclResult = null;
      try {
        const aclCommand = new GetObjectAclCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: objectKey,
        });
        aclResult = await s3Client.send(aclCommand);
      } catch (aclError) {
        console.log("Could not get ACL (this is normal for R2):", aclError);
      }
      
      // Generate the public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${objectKey}`;
      
      // Try to fetch the object using the public URL
      let isPubliclyAccessible = false;
      let fetchError = null;
      
      try {
        const fetchResponse = await fetch(publicUrl);
        isPubliclyAccessible = fetchResponse.ok;
        
        if (!fetchResponse.ok) {
          fetchError = {
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
          };
        }
      } catch (error) {
        fetchError = error instanceof Error ? error.message : String(error);
      }
      
      return NextResponse.json({
        success: true,
        objectExists: true,
        objectMetadata: {
          contentType: headResult.ContentType,
          contentLength: headResult.ContentLength,
          lastModified: headResult.LastModified,
        },
        acl: aclResult,
        publicUrl,
        isPubliclyAccessible,
        fetchError,
      });
    } catch (headError) {
      console.error("Object does not exist or access denied:", headError);
      
      return NextResponse.json({
        success: false,
        objectExists: false,
        error: headError instanceof Error ? headError.message : String(headError),
      });
    }
  } catch (error) {
    console.error("Error checking R2 object:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
