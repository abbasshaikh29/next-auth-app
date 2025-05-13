import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { PaymentPlan } from "@/models/PaymentPlan";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/payments/plans - Get payment plans
export async function GET(request: NextRequest) {
  try {
    await dbconnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get("planType");
    const communityId = searchParams.get("communityId");
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Build query
    const query: any = {};
    
    if (planType) {
      query.planType = planType;
    }
    
    if (communityId) {
      query.communityId = new mongoose.Types.ObjectId(communityId);
    }
    
    if (activeOnly) {
      query.isActive = true;
    }

    // Fetch plans
    const plans = await PaymentPlan.find(query).sort({ amount: 1 });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching payment plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment plans" },
      { status: 500 }
    );
  }
}

// POST /api/payments/plans - Create a new payment plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const {
      name,
      description,
      amount,
      currency = "INR",
      interval = "monthly",
      intervalCount = 1,
      trialPeriodDays = 0,
      features,
      planType,
      communityId,
    } = await request.json();

    // Validate required fields
    if (!name || !amount || amount <= 0 || !planType) {
      return NextResponse.json(
        { error: "Name, amount, and plan type are required" },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!["platform", "community"].includes(planType)) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // For community plans, verify communityId and admin permission
    if (planType === "community") {
      if (!communityId) {
        return NextResponse.json(
          { error: "Community ID is required for community plans" },
          { status: 400 }
        );
      }

      const community = await Community.findById(communityId);
      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }

      // Check if the user is the community admin
      if (community.admin !== session.user.id) {
        return NextResponse.json(
          { error: "Only community admins can create payment plans" },
          { status: 403 }
        );
      }
    } else if (planType === "platform") {
      // For platform plans, verify the user is a platform admin
      // This depends on your role system
      // Example:
      const user = await mongoose.model("User").findById(session.user.id);
      if (!user || user.role !== "platform_admin") {
        return NextResponse.json(
          { error: "Only platform admins can create platform plans" },
          { status: 403 }
        );
      }
    }

    // Create the payment plan
    const plan = new PaymentPlan({
      name,
      description,
      amount,
      currency,
      interval,
      intervalCount,
      trialPeriodDays,
      features: features || [],
      isActive: true,
      planType,
      communityId: communityId ? new mongoose.Types.ObjectId(communityId) : undefined,
      createdBy: session.user.id,
    });

    await plan.save();

    // If it's a community plan, add it to the community's payment plans
    if (planType === "community" && communityId) {
      await Community.findByIdAndUpdate(
        communityId,
        {
          $push: { paymentPlans: plan._id },
          $set: { paymentEnabled: true },
        }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error creating payment plan:", error);
    return NextResponse.json(
      { error: "Failed to create payment plan" },
      { status: 500 }
    );
  }
}
