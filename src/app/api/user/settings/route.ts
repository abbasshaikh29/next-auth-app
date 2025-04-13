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

    // Update fields and let model handle slug generation
    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;
    user.timezone = timezone;
    user.email = email;
    user.bio = bio;
    user.profileImageUrl = profileImageUrl;

    // Validate unique username before saving
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    await user.save();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
