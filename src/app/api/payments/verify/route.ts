import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { verifyPaymentSignature, fetchPaymentDetails } from "@/lib/razorpay";
import { Transaction } from "@/models/Transaction";
import { User } from "@/models/User";
import { PaymentPlan } from "@/models/PaymentPlan";
import mongoose from "mongoose";

// POST /api/payments/verify - Verify a Razorpay payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { orderId, paymentId, signature } = await request.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Order ID, payment ID, and signature are required" },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await Transaction.findOne({ orderId });
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Verify that the user making the request is the same as the one who created the transaction
    if (transaction.payerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify the payment signature
    const isValidSignature = verifyPaymentSignature(
      orderId,
      paymentId,
      signature
    );
    if (!isValidSignature) {
      // Update transaction status to failed
      transaction.status = "failed";
      await transaction.save();

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(paymentId);

    // Update transaction with payment details
    transaction.paymentId = paymentId;
    transaction.signature = signature;
    transaction.status =
      paymentDetails.status === "captured" ? "captured" : "authorized";
    await transaction.save();

    // Process the payment based on payment type
    if (transaction.paymentType === "platform") {
      // Handle platform payment (user becoming an admin)
      await handlePlatformPayment(transaction);
    } else if (transaction.paymentType === "community") {
      // Handle community payment (member paying to community admin)
      await handleCommunityPayment(transaction);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      transaction: {
        id: transaction._id,
        orderId: transaction.orderId,
        paymentId: transaction.paymentId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

// Handle platform payment (user becoming an admin)
async function handlePlatformPayment(transaction: any) {
  // Update user role to admin
  const user = await User.findById(transaction.payerId);
  if (!user) {
    throw new Error("User not found");
  }

  // Update user role and payment settings
  user.role = "admin";
  if (!user.paymentSettings) {
    user.paymentSettings = {};
  }

  // If there's a plan, set subscription details
  if (transaction.planId) {
    const plan = await PaymentPlan.findById(transaction.planId);
    if (plan) {
      // Set subscription ID and status
      user.paymentSettings.subscriptionId = transaction._id.toString();
      user.paymentSettings.subscriptionStatus = "active";

      // Calculate subscription end date based on plan interval
      const endDate = new Date();
      if (plan.interval === "monthly") {
        endDate.setMonth(endDate.getMonth() + (plan.intervalCount || 1));
      } else if (plan.interval === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + (plan.intervalCount || 1));
      } else {
        // For one-time payments, set end date to far future
        endDate.setFullYear(endDate.getFullYear() + 100);
      }

      user.paymentSettings.subscriptionEndDate = endDate;
    }
  }

  await user.save();
}

// Handle community payment (member paying to join community)
async function handleCommunityPayment(transaction: any) {
  if (!transaction.communityId) {
    throw new Error("Community ID is missing");
  }

  // Find the community
  const community = await mongoose
    .model("Community")
    .findById(transaction.communityId);
  if (!community) {
    throw new Error("Community not found");
  }

  // Find the user
  const user = await User.findById(transaction.payerId);
  if (!user) {
    throw new Error("User not found");
  }

  // Store transaction ID for reference
  transaction.metadata = transaction.metadata || {};
  transaction.metadata.membershipPayment = true;
  await transaction.save();

  // Note: We don't automatically add the user to the community here
  // Instead, we'll let the user complete the join process via the join-paid API
  // This allows for a better UX flow where the user can see a success message
  // and be redirected to the community page

  // Add the community to the user's communities list if not already there
  if (!user.community.includes(transaction.communityId)) {
    user.community.push(transaction.communityId);
    await user.save();
  }

  // If there's a plan, set subscription details for the user
  if (transaction.planId) {
    const plan = await PaymentPlan.findById(transaction.planId);
    if (plan) {
      if (!user.paymentSettings) {
        user.paymentSettings = {};
      }

      // Set subscription ID and status
      user.paymentSettings.subscriptionId = transaction._id.toString();
      user.paymentSettings.subscriptionStatus = "active";

      // Calculate subscription end date based on plan interval
      const endDate = new Date();
      if (plan.interval === "monthly") {
        endDate.setMonth(endDate.getMonth() + (plan.intervalCount || 1));
      } else if (plan.interval === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + (plan.intervalCount || 1));
      } else {
        // For one-time payments, set end date to far future
        endDate.setFullYear(endDate.getFullYear() + 100);
      }

      user.paymentSettings.subscriptionEndDate = endDate;
      await user.save();
    }
  }
}
