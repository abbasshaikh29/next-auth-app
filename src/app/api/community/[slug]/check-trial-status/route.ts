import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { ICommunity } from "@/models/Community";

// Define a type for the community document
interface CommunityDocument extends ICommunity {
  _id: any;
  admin: any;
  slug: string;
  adminTrialInfo?: {
    activated: boolean;
    startDate?: Date;
    endDate?: Date;
  };
  paymentStatus?: 'unpaid' | 'trial' | 'paid' | 'expired';
  freeTrialActivated?: boolean;
  subscriptionEndDate?: Date;
}

// GET /api/community/[slug]/check-trial-status - Check if a community has an active trial or payment
export async function GET(request: NextRequest) {
  // Get the slug from the URL
  const slug = request.nextUrl.pathname.split('/').pop();
  try {
    if (!slug) {
      return NextResponse.json(
        { error: "Community slug is required" },
        { status: 400 }
      );
    }

    // Get the userId from the query params
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find the community by slug
    const community = await Community.findOne({ slug }).lean() as unknown as CommunityDocument;
    if (!community) {
      return NextResponse.json(
        { error: "Community not found", hasActiveTrialOrPayment: false },
        { status: 404 }
      );
    }

    // Check if the user is the admin
    if (community.admin.toString() !== userId) {
      // Not the admin, so no need to check trial status
      return NextResponse.json({ hasActiveTrialOrPayment: true });
    }

    // Check if the community has an active trial or payment
    const hasActiveTrialOrPayment = 
      (community.adminTrialInfo?.activated === true && 
       community.adminTrialInfo?.endDate && 
       new Date(community.adminTrialInfo.endDate) > new Date()) ||
      community.paymentStatus === 'paid' ||
      (community.freeTrialActivated === true && 
       community.subscriptionEndDate && 
       new Date(community.subscriptionEndDate) > new Date());

    return NextResponse.json({ hasActiveTrialOrPayment });
  } catch (error) {
    console.error("Error checking trial status:", error);
    return NextResponse.json(
      { error: "Failed to check trial status", hasActiveTrialOrPayment: true },
      { status: 500 }
    );
  }
}
