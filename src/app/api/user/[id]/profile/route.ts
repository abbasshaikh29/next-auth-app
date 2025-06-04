import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const params = await context.params;
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow users to access their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      profileImage: user.profileImage || "",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to update their own profile
    const params = await context.params;
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestBody = await request.json();
    console.log("Received profile update request:", requestBody);

    const { firstName, lastName, bio, profileImage, ...rest } = requestBody;
    console.log("Extracted fields for update - firstName:", firstName, ", lastName:", lastName, ", bio:", bio, ", profileImage:", profileImage, ", other fields:", rest);
    console.log("Value of 'bio' variable before DB update:", bio);

    await dbconnect();

    // Find the user and update their profile
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      {
        $set: {
          firstName,
          lastName,
          bio,
          profileImage,
        },
      },
      { new: true }
    );

    console.log("Document after findByIdAndUpdate:", updatedUser);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName || "",
      lastName: updatedUser.lastName || "",
      bio: updatedUser.bio || "",
      profileImage: updatedUser.profileImage || "",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
