import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

// GET handler
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract slug from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const slug = pathSegments[pathSegments.indexOf("community") + 1];

    console.log("Fetching access settings for community:", slug);

    await dbconnect();

    // Find the community
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if the user is an admin or sub-admin
    const userId = session.user.id;
    const isAdmin = community.admin === userId;
    const isSubAdmin = community.subAdmins?.includes(userId) || false;

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        {
          error:
            "Only admins and sub-admins can view community access settings",
        },
        { status: 403 }
      );
    }

    console.log("Returning access settings:", {
      isPrivate: community.isPrivate,
      price: community.price,
      currency: community.currency,
    });

    const headers = new Headers({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    return NextResponse.json(
      {
        isPrivate: community.isPrivate,
        price: community.price,
        currency: community.currency,
        pricingType: community.pricingType || "one_time", // Default to one-time if not set
        timestamp: Date.now(), // Add timestamp to prevent caching
      },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching community access settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch community access settings" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract slug from the URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const slug = pathSegments[pathSegments.indexOf("community") + 1];

    const { isPrivate, price, currency, pricingType } = await request.json();

    await dbconnect();

    // Find the community first to check permissions
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if the user is an admin
    const userId = session.user.id;
    const isAdmin = community.admin === userId;

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only admins can update community access settings" },
        { status: 403 }
      );
    }

    // Create the update object with the fields to update
    const updateObj: any = {};

    // Only update fields that are provided
    if (isPrivate !== undefined) {
      updateObj.isPrivate = isPrivate;
    }

    if (price !== undefined) {
      updateObj.price = price;
    }

    if (currency !== undefined) {
      updateObj.currency = currency;
    }

    if (pricingType !== undefined) {
      updateObj.pricingType = pricingType;
    }

    console.log("Updating community with:", updateObj);

    // Update the community
    const updatedCommunity = await Community.findOneAndUpdate(
      { slug },
      { $set: updateObj },
      { new: true }
    );

    if (!updatedCommunity) {
      return NextResponse.json(
        { error: "Failed to update community access settings" },
        { status: 500 }
      );
    }

    const headers = new Headers({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    return NextResponse.json(
      {
        success: true,
        isPrivate: updatedCommunity.isPrivate,
        price: updatedCommunity.price,
        currency: updatedCommunity.currency,
        pricingType: updatedCommunity.pricingType,
        timestamp: Date.now(), // Add timestamp to prevent caching
      },
      { headers }
    );
  } catch (error) {
    console.error("Error updating community access settings:", error);
    return NextResponse.json(
      { error: "Failed to update community access settings" },
      { status: 500 }
    );
  }
}
