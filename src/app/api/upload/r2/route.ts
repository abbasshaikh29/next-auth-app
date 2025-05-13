import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { generateUploadUrl, generateCoursePath, getPublicUrl } from "@/lib/r2";

// POST /api/upload/r2 - Generate a presigned URL for R2 upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      fileName,
      fileType,
      courseId,
      moduleId,
      lessonId,
      type,
      communityId,
    } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "File name and type are required" },
        { status: 400 }
      );
    }

    // Determine the folder path based on the upload type
    let folder = "uploads";

    if (type === "course" && courseId) {
      folder = generateCoursePath(courseId, moduleId, lessonId);
    } else if (type === "thumbnail" && courseId) {
      folder = `courses/${courseId}/thumbnails`;
    } else if (type === "profile") {
      folder = `profiles/${session.user.id}`;
    } else if (type === "community" && communityId) {
      folder = `communities/${communityId}`;
    } else if (type === "community-banner") {
      // Use community ID if provided, otherwise use a general folder
      folder = communityId
        ? `communities/${communityId}/banners`
        : "communities/banners";
    } else if (type === "community-icon") {
      // Use community ID if provided, otherwise use a general folder
      folder = communityId
        ? `communities/${communityId}/icons`
        : "communities/icons";
    } else if (type === "post-image") {
      // Store post images in a dedicated folder
      folder = communityId
        ? `communities/${communityId}/posts/images`
        : `posts/images/${session.user.id}`;
    } else if (type === "message-image") {
      // Store message images in a dedicated folder
      folder = `messages/images/${session.user.id}`;
    } else if (type === "community-about-media") {
      // Store community about media in a dedicated folder
      folder = communityId
        ? `communities/${communityId}/about-media`
        : `communities/about-media/${session.user.id}`;
    }

    // Generate the presigned URL
    const { uploadUrl, key } = await generateUploadUrl(
      fileName,
      fileType,
      folder
    );

    // Get the public URL
    const fileUrl = getPublicUrl(key);

    return NextResponse.json({
      uploadUrl,
      key,
      fileUrl,
    });
  } catch (error) {
    console.error("Error generating R2 upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
