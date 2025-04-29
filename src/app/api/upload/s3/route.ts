import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { generateUploadUrl, generateCoursePath } from "@/lib/s3";

// POST /api/upload/s3 - Generate a presigned URL for S3 upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileType, courseId, moduleId, lessonId, type } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "File name and type are required" },
        { status: 400 }
      );
    }

    // Determine the folder path based on the upload type
    let folder = 'uploads';
    
    if (type === 'course' && courseId) {
      folder = generateCoursePath(courseId, moduleId, lessonId);
    } else if (type === 'thumbnail' && courseId) {
      folder = `courses/${courseId}/thumbnails`;
    } else if (type === 'profile') {
      folder = `profiles/${session.user.id}`;
    } else if (type === 'community' && courseId) {
      folder = `communities/${courseId}`;
    }

    // Generate the presigned URL
    const { uploadUrl, key } = await generateUploadUrl(fileName, fileType, folder);

    return NextResponse.json({
      uploadUrl,
      key,
      fileUrl: `${process.env.NEXT_PUBLIC_S3_URL}/${key}`,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
