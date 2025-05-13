import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";
import { convertS3UrlToR2, isS3Url } from "@/utils/s3-to-r2-migration";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbconnect();

    // Get user from database
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile image is S3 URL
    const isS3ProfileImage = isS3Url(user.profileImage || "");
    let r2ProfileImage = null;

    if (isS3ProfileImage) {
      r2ProfileImage = convertS3UrlToR2(user.profileImage);
    }

    return NextResponse.json({
      profileImage: user.profileImage,
      r2ProfileImage,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
