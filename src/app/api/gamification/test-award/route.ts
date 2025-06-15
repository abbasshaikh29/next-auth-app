import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { awardPoints } from "@/lib/gamification";

// POST /api/gamification/test-award - Award test points (development only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow in development environment
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Test endpoints not available in production" },
        { status: 403 }
      );
    }

    const { userId, points, communityId } = await request.json();

    if (!userId || points === undefined) {
      return NextResponse.json(
        { error: "User ID and points are required" },
        { status: 400 }
      );
    }

    // Only allow users to award points to themselves in test mode
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Can only award test points to yourself" },
        { status: 403 }
      );
    }

    const result = await awardPoints(userId, points, communityId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error awarding test points:", error);
    return NextResponse.json(
      { error: "Failed to award test points" },
      { status: 500 }
    );
  }
}
