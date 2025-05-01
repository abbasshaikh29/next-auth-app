import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";

// PUT /api/user/profile-image - Update user profile image
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileImage } = await request.json();
    console.log("Profile Image API PUT: Received profile image URL:", profileImage);

    if (!profileImage) {
      return NextResponse.json(
        { error: "Profile image URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(profileImage);
    } catch (e) {
      console.error("Profile Image API PUT: Invalid URL format:", profileImage, e);
      return NextResponse.json(
        { error: "Invalid profile image URL format" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Update the profile image URL
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { profileImage } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Failed to update profile image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}
