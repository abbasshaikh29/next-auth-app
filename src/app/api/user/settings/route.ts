import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";

export async function PUT(request: Request) {
  await dbconnect();
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    firstName,
    lastName,
    timezone,
    username,
    email,
    bio,
    profileImageUrl,
  } = await request.json();

  try {
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate username format
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          error: "Username can only contain letters, numbers, and underscores",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Check if username is being changed
    if (username !== user.username) {
      // Validate unique username before saving
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    // Check if email is being changed
    if (email !== user.email) {
      // Validate unique email before saving
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Update fields and let model handle slug generation
    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;
    user.timezone = timezone;
    user.email = email;
    user.bio = bio;
    user.profileImage = profileImageUrl; // Note: Changed from profileImageUrl to match the model

    await user.save();

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
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
