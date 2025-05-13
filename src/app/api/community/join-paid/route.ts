import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { Transaction } from "@/models/Transaction";
import mongoose from "mongoose";

// POST /api/community/join-paid - Join a community after payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { communityId, transactionId } = await request.json();

    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is already a member
    if (community.members.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    // Verify the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Verify transaction belongs to this user and community
    if (
      transaction.payerId !== session.user.id ||
      transaction.communityId?.toString() !== communityId ||
      transaction.status !== "captured"
    ) {
      return NextResponse.json(
        { error: "Invalid transaction" },
        { status: 400 }
      );
    }

    // Add user to community members
    if (!community.members.includes(session.user.id)) {
      community.members.push(session.user.id);
    }

    // Add a join request with approved status for record-keeping
    if (!community.joinRequests) {
      community.joinRequests = [];
    }

    // Check if a request already exists
    const existingRequestIndex = community.joinRequests.findIndex(
      (request: any) => request.userId === session.user.id
    );

    if (existingRequestIndex >= 0) {
      // Update existing request
      community.joinRequests[existingRequestIndex].status = "approved";
    } else {
      // Add new request with approved status
      community.joinRequests.push({
        userId: session.user.id,
        status: "approved",
        answers: [],
        createdAt: new Date(),
      });
    }

    await community.save();

    return NextResponse.json({
      success: true,
      message: "Successfully joined community",
    });
  } catch (error) {
    console.error("Error joining community after payment:", error);
    return NextResponse.json(
      { error: "Failed to join community" },
      { status: 500 }
    );
  }
}
