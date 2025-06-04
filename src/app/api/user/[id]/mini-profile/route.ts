import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

// Using the type-safe handler pattern for Next.js 15.3.0
export async function GET(request: NextRequest) {
  // Extract the id from the URL path
  const id = request.nextUrl.pathname.split('/').pop() || '';
  try {
    const { db } = await connectToDatabase();
    const session = await auth();

    // Check if user ID is valid
    let userId;
    try {
      userId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Get basic user data for hover card
    const user = await db.collection("users").findOne(
      { _id: userId },
      {
        projection: {
          _id: 1,
          username: 1,
          profileImage: 1,
          bio: 1,
          followers: 1,
          following: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the current user is following this user
    let isFollowing = false;
    if (session?.user?.id) {
      const currentUser = await db.collection("users").findOne({
        _id: new ObjectId(session.user.id),
        following: userId.toString(),
      });
      isFollowing = !!currentUser;
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
        isFollowing,
        followerCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching user mini-profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
