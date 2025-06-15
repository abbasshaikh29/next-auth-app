import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { getUserGamificationData } from "@/lib/gamification";

// GET /api/gamification/user/[userId] - Get user's gamification data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");

    const gamificationData = await getUserGamificationData(
      params.userId,
      communityId || undefined
    );

    return NextResponse.json(gamificationData);
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return NextResponse.json(
      { error: "Failed to fetch gamification data" },
      { status: 500 }
    );
  }
}
