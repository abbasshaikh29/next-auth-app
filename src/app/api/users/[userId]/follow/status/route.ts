import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ userId: string }> }
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ isFollowing: false }, { status: 200 });
    }

    await dbconnect();
    
    const currentUserId = session.user.id;

    if (!params || !params.userId) {
      return NextResponse.json(
        { message: "Target user ID not provided in parameters." },
        { status: 400 }
      );
    }
    const targetUserId = params.userId;

    // If checking self, return not following
    if (currentUserId === targetUserId) {
      return NextResponse.json({ isFollowing: false }, { status: 200 });
    }

    // Check if current user is following target user
    const currentUser = await User.findById(currentUserId);
    
    if (!currentUser) {
      return NextResponse.json({ isFollowing: false }, { status: 200 });
    }

    const isFollowing = currentUser.following.some(
      (id: mongoose.Types.ObjectId) => id.toString() === targetUserId
    );

    return NextResponse.json({ isFollowing }, { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_STATUS_ERROR]", error);
    return NextResponse.json({ isFollowing: false }, { status: 500 });
  }
}
