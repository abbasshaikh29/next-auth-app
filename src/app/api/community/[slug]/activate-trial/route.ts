import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

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
    
    console.log('Setting trial end date to:', trialEndDate);

    // Update admin-specific trial information
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

    // Save the updated community
    await community.save();
    
    // Verify the data was saved correctly
    const updatedCommunity = await Community.findOne({ slug });
    
    console.log('Verification - Updated community data:', {
      adminTrialInfo: updatedCommunity?.adminTrialInfo,
      paymentStatus: updatedCommunity?.paymentStatus,
      subscriptionEndDate: updatedCommunity?.subscriptionEndDate
    });

    return NextResponse.json({ 
      success: true,
      message: "Free trial activated successfully for admin",
      trialEndDate,
      community: {
        _id: updatedCommunity?._id,
        adminTrialInfo: updatedCommunity?.adminTrialInfo,
        paymentStatus: updatedCommunity?.paymentStatus,
        subscriptionEndDate: updatedCommunity?.subscriptionEndDate
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
