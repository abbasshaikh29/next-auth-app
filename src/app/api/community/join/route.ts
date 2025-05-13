import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { Community } from "@/models/Community";

import { dbconnect } from "@/lib/db";

interface JoinRequest {
  userId: string;
  status: string;
  answers: string[];
  createdAt: Date;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, answers } = await req.json();
    await dbconnect();

    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Initialize members array if it doesn't exist
    if (!community.members) {
      community.members = [];
    }

    // Check if user is already a member
    if (community.members.includes(session.user.id)) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    // Check if community requires payment to join
    if (community.paymentEnabled && community.subscriptionRequired) {
      return NextResponse.json(
        {
          error: "This community requires payment to join",
          requiresPayment: true,
          communityId: community._id,
        },
        { status: 402 }
      );
    }

    // Initialize joinRequests array if it doesn't exist
    if (!community.joinRequests) {
      community.joinRequests = [];
    }

    // Check if user already has a pending request
    const existingRequest = community.joinRequests.find(
      (request: JoinRequest) =>
        request.userId === session.user.id && request.status === "pending"
    );
    if (existingRequest) {
      return NextResponse.json(
        { error: "Request already pending" },
        { status: 400 }
      );
    }

    // Add join request
    community.joinRequests.push({
      userId: session.user.id,
      status: "pending",
      answers: answers || [],
      createdAt: new Date(),
    });

    await community.save();

    return NextResponse.json({ message: "Join request sent successfully" });
  } catch (error) {
    console.error("Error in join request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
