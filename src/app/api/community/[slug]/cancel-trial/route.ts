import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

// POST /api/community/[slug]/cancel-trial - Cancel a community's free trial
export async function POST(request: NextRequest) {
  // Get the slug from the URL
  const slug = request.nextUrl.pathname.split('/').pop();
  try {
    // Get the authenticated user
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Slug is already extracted from the URL
    if (!slug) {
      return NextResponse.json(
        { error: "Community slug is required" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find the community by slug
    const community = await Community.findOne({ slug });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if the user is the admin of the community
    if (community.admin.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Only the community admin can cancel the trial" },
        { status: 403 }
      );
    }

    // Check if the trial is active
    const hasActiveTrial = 
      (community.adminTrialInfo?.activated === true) || 
      (community.freeTrialActivated === true);

    if (!hasActiveTrial) {
      return NextResponse.json(
        { error: "No active trial to cancel" },
        { status: 400 }
      );
    }

    // Cancel the trial and suspend the community
    if (community.adminTrialInfo) {
      community.adminTrialInfo.activated = false;
      community.adminTrialInfo.cancelled = true;
      community.adminTrialInfo.cancelledDate = new Date();
    }
    
    community.freeTrialActivated = false;
    community.paymentStatus = "suspended";
    community.suspended = true;
    community.suspensionReason = "Trial cancelled by admin";
    community.suspensionDate = new Date();

    await community.save();

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Trial cancelled successfully. Community has been suspended.",
      community: {
        _id: community._id,
        name: community.name,
        slug: community.slug,
        paymentStatus: community.paymentStatus,
        suspended: community.suspended,
      }
    });
  } catch (error) {
    console.error("Error cancelling trial:", error);
    return NextResponse.json(
      { error: "Failed to cancel trial", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
