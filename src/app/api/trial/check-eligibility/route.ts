import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { checkTrialEligibility } from "@/lib/trial-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { trialType, communityId } = await request.json();

    if (!trialType || !["user", "community"].includes(trialType)) {
      return NextResponse.json(
        { error: "Valid trial type is required (user or community)" },
        { status: 400 }
      );
    }

    if (trialType === "community" && !communityId) {
      return NextResponse.json(
        { error: "Community ID is required for community trials" },
        { status: 400 }
      );
    }

    // Check trial eligibility
    const eligibility = await checkTrialEligibility(
      session.user.id,
      trialType,
      communityId
    );

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error("Error checking trial eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check trial eligibility" },
      { status: 500 }
    );
  }
}
