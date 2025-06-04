import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

// Using the type-safe handler pattern for Next.js 15.3.0
export async function POST(request: NextRequest) {
  // Extract the id from the URL path
  const id = request.nextUrl.pathname.split('/').pop() || '';
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const currentUserId = session.user.id;
    
    // Check if user ID is valid
    let targetUserId;
    try {
      targetUserId = new ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Don't allow following yourself
    if (currentUserId === id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await db.collection("users").findOne({ _id: targetUserId });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already following
    const currentUser = await db.collection("users").findOne({
      _id: new ObjectId(currentUserId),
      following: id,
    });

    if (currentUser) {
      // Unfollow if already following
      // Use proper MongoDB update operations with correct TypeScript typings
      await db.collection("users").updateOne(
        { _id: new ObjectId(currentUserId) },
        { $pull: { following: id } as any }
      );

      await db.collection("users").updateOne(
        { _id: targetUserId },
        { $pull: { followers: currentUserId } as any }
      );

      return NextResponse.json({ success: true, action: "unfollowed" });
    } else {
      // Follow if not already following
      await db.collection("users").updateOne(
        { _id: new ObjectId(currentUserId) },
        { $addToSet: { following: id } }
      );

      await db.collection("users").updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: currentUserId } }
      );

      return NextResponse.json({ success: true, action: "followed" });
    }
  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to process follow request" },
      { status: 500 }
    );
  }
}
