import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { createOrder } from "@/lib/razorpay";
import { Transaction } from "@/models/Transaction";
import { PaymentPlan } from "@/models/PaymentPlan";
import { User } from "@/models/User";
import { Community } from "@/models/Community";
import mongoose from "mongoose";
import loadEnv from "@/lib/env-loader";

// Load environment variables
loadEnv();

// POST /api/payments/create-order - Create a new Razorpay order
export async function POST(request: NextRequest) {
  try {
    // Debug: Log environment variables
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "***" : "not set");
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "***" : "not set");

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const {
      amount,
      currency = "INR",
      planId,
      paymentType,
      communityId,
    } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!paymentType || !["platform", "community"].includes(paymentType)) {
      return NextResponse.json(
        { error: "Valid payment type is required" },
        { status: 400 }
      );
    }

    // For community payments, verify communityId
    if (paymentType === "community" && !communityId) {
      return NextResponse.json(
        { error: "Community ID is required for community payments" },
        { status: 400 }
      );
    }

    // If planId is provided, verify it exists
    let plan = null;
    if (planId) {
      plan = await PaymentPlan.findById(planId);
      if (!plan) {
        return NextResponse.json(
          { error: "Payment plan not found" },
          { status: 404 }
        );
      }
    }

    // For community payments, get the community admin
    let payeeId = null;
    if (paymentType === "community" && communityId) {
      const community = await Community.findById(communityId);
      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }
      payeeId = community.admin;
    }

    // Create a receipt ID
    const receiptId = `receipt_${session.user.id.substring(0, 8)}`;

    // Create metadata for the order
    const metadata: Record<string, any> = {
      userId: session.user.id,
      paymentType,
    };

    if (planId) {
      metadata.planId = planId;
    }

    if (communityId) {
      metadata.communityId = communityId;
    }

    if (payeeId) {
      metadata.payeeId = payeeId;
    }

    // Create Razorpay order
    const order = await createOrder(amount, currency, receiptId, metadata);

    // Save transaction record
    const transaction = new Transaction({
      orderId: order.id,
      amount,
      currency,
      status: "created",
      paymentType,
      payerId: session.user.id,
      payeeId,
      communityId: communityId
        ? new mongoose.Types.ObjectId(communityId)
        : undefined,
      planId: planId ? new mongoose.Types.ObjectId(planId) : undefined,
      metadata,
    });

    await transaction.save();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount / 100, // Convert back to main currency unit
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
