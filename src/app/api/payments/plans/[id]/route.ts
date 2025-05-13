import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { PaymentPlan } from "@/models/PaymentPlan";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/payments/plans/[id] - Get a specific payment plan
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbconnect();
    const params = await context.params;
    const plan = await PaymentPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Payment plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching payment plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment plan" },
      { status: 500 }
    );
  }
}

// PUT /api/payments/plans/[id] - Update a payment plan
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const params = await context.params;
    const plan = await PaymentPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Payment plan not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (plan.planType === "community") {
      // For community plans, verify the user is the community admin
      if (plan.communityId) {
        const community = await Community.findById(plan.communityId);
        if (!community || community.admin !== session.user.id) {
          return NextResponse.json(
            { error: "Only community admins can update their payment plans" },
            { status: 403 }
          );
        }
      }
    } else if (plan.planType === "platform") {
      // For platform plans, verify the user is a platform admin
      const user = await mongoose.model("User").findById(session.user.id);
      if (!user || user.role !== "platform_admin") {
        return NextResponse.json(
          { error: "Only platform admins can update platform plans" },
          { status: 403 }
        );
      }
    }

    // Get update data
    const {
      name,
      description,
      amount,
      currency,
      interval,
      intervalCount,
      trialPeriodDays,
      features,
      isActive,
    } = await request.json();

    // Update fields
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (amount !== undefined && amount > 0) plan.amount = amount;
    if (currency !== undefined) plan.currency = currency;
    if (interval !== undefined) plan.interval = interval;
    if (intervalCount !== undefined) plan.intervalCount = intervalCount;
    if (trialPeriodDays !== undefined) plan.trialPeriodDays = trialPeriodDays;
    if (features !== undefined) plan.features = features;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating payment plan:", error);
    return NextResponse.json(
      { error: "Failed to update payment plan" },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/plans/[id] - Delete a payment plan
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const params = await context.params;
    const plan = await PaymentPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Payment plan not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (plan.planType === "community") {
      // For community plans, verify the user is the community admin
      if (plan.communityId) {
        const community = await Community.findById(plan.communityId);
        if (!community || community.admin !== session.user.id) {
          return NextResponse.json(
            { error: "Only community admins can delete their payment plans" },
            { status: 403 }
          );
        }

        // Remove the plan from the community's payment plans
        await Community.findByIdAndUpdate(
          plan.communityId,
          { $pull: { paymentPlans: plan._id } }
        );
      }
    } else if (plan.planType === "platform") {
      // For platform plans, verify the user is a platform admin
      const user = await mongoose.model("User").findById(session.user.id);
      if (!user || user.role !== "platform_admin") {
        return NextResponse.json(
          { error: "Only platform admins can delete platform plans" },
          { status: 403 }
        );
      }
    }

    // Delete the plan
    await PaymentPlan.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment plan:", error);
    return NextResponse.json(
      { error: "Failed to delete payment plan" },
      { status: 500 }
    );
  }
}
