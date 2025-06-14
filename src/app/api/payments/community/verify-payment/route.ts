import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { verifyPaymentSignature, fetchPaymentDetails } from "@/lib/razorpay";
import { Transaction } from "@/models/Transaction";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// POST /api/payments/community/verify-payment - Verify and process a Razorpay payment for a community
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { 
      paymentId, 
      orderId, 
      signature, 
      communityId 
    } = await request.json();

    if (!paymentId || !orderId || !signature || !communityId) {
      return NextResponse.json(
        { error: "Payment details are required" },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(paymentId);
    
    // Check if payment is successful
    if (paymentDetails.status !== "captured" && paymentDetails.status !== "authorized") {
      return NextResponse.json(
        { error: "Payment not successful", status: paymentDetails.status },
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

    // Update transaction status
    transaction.status = "captured";
    transaction.paymentId = paymentId;
    transaction.paymentDetails = paymentDetails;
    await transaction.save();

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Calculate subscription end date (1 year from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);

    // Update community with payment information
    community.paymentStatus = "paid";
    community.subscriptionEndDate = subscriptionEndDate;
    
    // If they had a trial, mark it as converted
    if (community.freeTrialActivated || (community.adminTrialInfo && community.adminTrialInfo.activated)) {
      if (community.adminTrialInfo) {
        community.adminTrialInfo.converted = true;
      }
      community.freeTrialActivated = false; // No longer on trial
    }
    
    // Add payment record to community
    if (!community.paymentHistory) {
      community.paymentHistory = [];
    }
    
    community.paymentHistory.push({
      transactionId: transaction._id,
      paymentId,
      amount: transaction.amount,
      currency: transaction.currency,
      date: new Date(),
      planType: "annual", // Default to annual plan
    });
    
    await community.save();

    // Return success response with updated community info
    return NextResponse.json({
      success: true,
      message: "Payment verified and processed successfully",
      community: {
        _id: community._id,
        name: community.name,
        slug: community.slug,
        paymentStatus: community.paymentStatus,
        subscriptionEndDate: community.subscriptionEndDate,
      }
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
