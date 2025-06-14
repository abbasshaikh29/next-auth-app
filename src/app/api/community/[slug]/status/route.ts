import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community, ICommunity } from "@/models/Community";

// Define a type for the community document
interface CommunityDocument extends ICommunity {
  _id: any;
  admin: any;
  slug: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find the community by slug
    const community = await Community.findOne({ slug }).lean() as unknown as CommunityDocument;
    
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if community is suspended
    const suspended = community.suspended || false;
    const suspensionReason = community.suspensionReason || null;
    const suspendedAt = community.suspendedAt || null;

    // Check if community has active trial or payment
    const hasActiveTrialOrPayment = 
      // Has active payment
      community.paymentStatus === 'paid' ||
      // Has active trial (admin trial)
      (community.adminTrialInfo?.activated === true && 
       community.adminTrialInfo?.endDate && 
       new Date(community.adminTrialInfo.endDate) > new Date()) ||
      // Has active trial (legacy free trial)
      (community.freeTrialActivated === true && 
       community.subscriptionEndDate && 
       new Date(community.subscriptionEndDate) > new Date());

    // Calculate days remaining if there's an active trial
    let daysRemaining = null;
    if (hasActiveTrialOrPayment && community.paymentStatus !== 'paid') {
      const endDate = community.adminTrialInfo?.endDate 
        ? new Date(community.adminTrialInfo.endDate)
        : community.subscriptionEndDate 
          ? new Date(community.subscriptionEndDate)
          : null;
      
      if (endDate) {
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysRemaining = diffDays > 0 ? diffDays : 0;
      }
    }

    return NextResponse.json({
      communityId: community._id.toString(),
      slug: community.slug,
      name: community.name,
      suspended,
      suspensionReason,
      suspendedAt,
      hasActiveTrialOrPayment,
      paymentStatus: community.paymentStatus,
      daysRemaining,
      trialInfo: {
        activated: community.adminTrialInfo?.activated || false,
        hasUsedTrial: community.adminTrialInfo?.hasUsedTrial || false,
        startDate: community.adminTrialInfo?.startDate,
        endDate: community.adminTrialInfo?.endDate,
      }
    });
  } catch (error) {
    console.error("Error checking community status:", error);
    return NextResponse.json(
      { 
        error: "Failed to check community status",
        // Return safe defaults in case of error
        suspended: false,
        hasActiveTrialOrPayment: true
      },
      { status: 500 }
    );
  }
}
