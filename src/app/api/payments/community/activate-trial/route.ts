import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { User } from "@/models/User";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { communityId, userId } = body;

    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find the community
    console.log('Finding community with ID:', communityId);
    const community = await Community.findById(communityId);
    if (!community) {
      console.error('Community not found with ID:', communityId);
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

    // Check if the user is the community admin
    if (community.admin.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this community" },
        { status: 403 }
      );
    }

    // Set trial end date to 14 days from now
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    console.log('Activating trial for community:', communityId);
    console.log('Current community state:', {
      adminTrialInfo: community.adminTrialInfo,
      paymentStatus: community.paymentStatus
    });

    // Update admin-specific trial information instead of community-wide trial
    console.log('Setting adminTrialInfo directly on community document');
    
    // Use direct assignment with set method to ensure the schema is updated correctly
    community.set({
      'adminTrialInfo.activated': true,
      'adminTrialInfo.startDate': new Date(),
      'adminTrialInfo.endDate': trialEndDate,
      'paymentStatus': 'trial',
      'subscriptionEndDate': trialEndDate,
      'freeTrialActivated': true  // Also set this flag to true
    });
    
    console.log('Community after setting fields:', {
      adminTrialInfo: community.get('adminTrialInfo'),
      paymentStatus: community.get('paymentStatus'),
      freeTrialActivated: community.get('freeTrialActivated')
    });
    
    console.log('Modified community document before save:', {
      adminTrialInfo: community.adminTrialInfo,
      paymentStatus: community.paymentStatus,
      subscriptionEndDate: community.subscriptionEndDate
    });

    // Save the updated community with error handling
    let updatedCommunity;
    try {
      updatedCommunity = await community.save();
      console.log('Community saved successfully');
    } catch (saveError) {
      console.error('Error saving community:', saveError);
      throw saveError;
    }
    
    console.log('Trial activated successfully. Updated community:', {
      adminTrialInfo: updatedCommunity.adminTrialInfo,
      paymentStatus: updatedCommunity.paymentStatus,
      subscriptionEndDate: updatedCommunity.subscriptionEndDate
    });

    return NextResponse.json({ 
      success: true,
      message: "Free trial activated successfully for admin",
      trialEndDate
    });
  } catch (error) {
    console.error("Error activating free trial:", error);
    return NextResponse.json(
      { error: "Failed to activate free trial" },
      { status: 500 }
    );
  }
}
