import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/payments/transactions - Get transaction history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type"); // "payer" or "payee"
    const paymentType = searchParams.get("paymentType"); // "platform" or "community"
    const communityId = searchParams.get("communityId");
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    
    // Filter by user role (payer or payee)
    if (type === "payer") {
      query.payerId = session.user.id;
    } else if (type === "payee") {
      query.payeeId = session.user.id;
    } else {
      // Default: show both payer and payee transactions
      query.$or = [
        { payerId: session.user.id },
        { payeeId: session.user.id },
      ];
    }
    
    // Filter by payment type
    if (paymentType) {
      query.paymentType = paymentType;
    }
    
    // Filter by community
    if (communityId) {
      // Verify the user has access to this community
      const community = await Community.findById(communityId);
      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }
      
      // Check if user is admin or member of the community
      const isAdmin = community.admin === session.user.id;
      const isMember = community.members.includes(session.user.id);
      
      if (!isAdmin && !isMember) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      query.communityId = new mongoose.Types.ObjectId(communityId);
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("planId", "name description")
      .populate("communityId", "name slug");
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
