import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community, ICommunity } from "@/models/Community";
import slugify from "slugify";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "2", 10);

    // Validate and sanitize pagination parameters
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 2; // Using 2 for testing
    const skip = (validPage - 1) * validLimit;

    await dbconnect();

    // Get total count for pagination
    const totalCommunities = await Community.countDocuments({});

    // Get communities with pagination, sorted by number of members in descending order
    const communities = await Community.aggregate([
      // Add a field for the number of members (array length)
      { $addFields: { memberCount: { $size: { $ifNull: ["$members", []] } } } },
      // Sort by member count in descending order
      { $sort: { memberCount: -1 } },
      // Apply pagination
      { $skip: skip },
      { $limit: validLimit },
    ]);

    // Convert MongoDB ObjectIds to strings for proper JSON serialization
    const serializedCommunities = communities.map((community) => ({
      ...community,
      _id: community._id.toString(),
      paymentPlans: community.paymentPlans
        ? community.paymentPlans.map((id: mongoose.Types.ObjectId) =>
            id.toString()
          )
        : undefined,
    }));

    if (!communities || communities.length === 0) {
      return NextResponse.json(
        {
          communities: [],
          pagination: {
            total: totalCommunities,
            page: validPage,
            limit: validLimit,
            pages: Math.ceil(totalCommunities / validLimit),
            hasNextPage: validPage < Math.ceil(totalCommunities / validLimit),
            hasPrevPage: validPage > 1,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      communities: serializedCommunities,
      pagination: {
        total: totalCommunities,
        page: validPage,
        limit: validLimit,
        pages: Math.ceil(totalCommunities / validLimit),
        hasNextPage: validPage < Math.ceil(totalCommunities / validLimit),
        hasPrevPage: validPage > 1,
      },
    });
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const body: ICommunity = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new community with default values
    const communityData: ICommunity = {
      ...body,
      createdBy: session.user.username,
    };

    // Create document instance
    const newCommunity = new Community(communityData);

    // Explicitly generate slug if not set
    if (!newCommunity.slug && newCommunity.name) {
      newCommunity.slug = slugify(newCommunity.name, {
        lower: true,
        strict: true,
      });
    }

    await newCommunity.save();
    return NextResponse.json(newCommunity);
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
