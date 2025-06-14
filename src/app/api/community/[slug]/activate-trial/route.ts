import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { checkTrialEligibility, activateTrial } from "@/lib/trial-service";

export async function POST(request: NextRequest) {
  // Extract the slug from the URL path
  const slug = request.nextUrl.pathname.split('/').pop();
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find the community by slug
    console.log('Finding community with slug:', slug);
    const community = await Community.findOne({ slug });

    if (!community) {
      console.error('Community not found with slug:', slug);
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    console.log('Found community:', {
      id: community._id,
      name: community.name,
      slug: community.slug
    });

    // Get client IP and user agent for fraud detection
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check trial eligibility using the secure trial service
    const eligibility = await checkTrialEligibility(
      session.user.id,
      "community",
      community._id.toString()
    );

    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason },
        { status: 400 }
      );
    }

    // Activate trial using the secure trial service
    const result = await activateTrial(
      session.user.id,
      "community",
      community._id.toString(),
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Fetch updated community data
    const updatedCommunity = await Community.findOne({ slug });

    console.log('Trial activated successfully:', {
      userId: session.user.id,
      communityId: community._id,
      trialEndDate: result.trialEndDate
    });

    return NextResponse.json({
      success: true,
      message: "Free trial activated successfully. This is your one-time trial - make the most of it!",
      trialEndDate: result.trialEndDate,
      community: {
        _id: updatedCommunity?._id,
        adminTrialInfo: updatedCommunity?.adminTrialInfo,
        paymentStatus: updatedCommunity?.paymentStatus,
        subscriptionEndDate: updatedCommunity?.subscriptionEndDate,
        freeTrialActivated: updatedCommunity?.freeTrialActivated
      }
    });
  } catch (error) {
    console.error("Error activating free trial:", error);
    return NextResponse.json(
      { error: "Failed to activate free trial" },
      { status: 500 }
    );
  }
}
