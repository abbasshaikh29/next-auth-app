import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { getLeaderboard } from "@/lib/gamification";

// GET /api/gamification/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");
    const period = searchParams.get("period") as "7day" | "30day" | "alltime" || "30day";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    const leaderboard = await getLeaderboard(communityId, period, limit);

    return NextResponse.json({
      leaderboard,
      period,
      communityId,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
