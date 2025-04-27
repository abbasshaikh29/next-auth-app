import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { getServerSession } from "@/lib/auth-helpers";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;
    console.log("Icon API: Fetching icon for slug:", slug);

    // Add cache control headers to prevent caching
    const headers = new Headers({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    await dbconnect();

    // Find the community with a fresh query
    const community = await Community.findOne({ slug });

    if (!community) {
      console.log("Icon API: Community not found for slug:", slug);
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404, headers }
      );
    }

    // Convert to plain object for logging
    const communityObj = community.toObject();

    console.log("Icon API: Community found:", {
      id: communityObj._id.toString(),
      name: communityObj.name,
      iconImageUrl: communityObj.iconImageUrl || "<empty>",
    });

    // Try to validate the icon URL
    let iconUrl = community.iconImageUrl || "";
    let isValid = false;

    if (iconUrl && iconUrl.trim() !== "") {
      try {
        // Validate URL format
        new URL(iconUrl);
        isValid = true;
      } catch (e) {
        console.error("Icon API: Invalid URL format:", iconUrl, e);
        iconUrl = "";
      }
    }

    return NextResponse.json(
      {
        success: true,
        iconImageUrl: iconUrl,
        isValid,
        timestamp: Date.now(),
      },
      { headers }
    );
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: "Failed to fetch community icon" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { iconImageUrl } = await request.json();
    console.log("Icon API PUT: Received icon URL:", iconImageUrl);

    if (!iconImageUrl) {
      return NextResponse.json(
        { error: "Icon image URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(iconImageUrl);
    } catch (e) {
      console.error("Icon API PUT: Invalid URL format:", iconImageUrl, e);
      return NextResponse.json(
        { error: "Invalid icon image URL format" },
        { status: 400 }
      );
    }

    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    await dbconnect();

    // Find the community first to check permissions
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
        { error: "Only admins and sub-admins can update community settings" },
        { status: 403 }
      );
    }

    // Try multiple approaches to update the icon image URL
    let updatedCommunity = null;

    // Approach 1: Use findOneAndUpdate with the slug
    try {
      console.log("Icon API PUT: Attempting update with findOneAndUpdate");
      updatedCommunity = await Community.findOneAndUpdate(
        { slug },
        { $set: { iconImageUrl } },
        { new: true }
      );

      console.log("Icon API PUT: Update result:", {
        success: !!updatedCommunity,
        iconImageUrl: updatedCommunity?.iconImageUrl || "<not set>",
      });
      // Approach 1 completed
    } catch (error) {
      console.error("Icon API PUT: Error in approach 1:", error);
    }

    // Approach 2: If the first approach didn't work, try updating by ID
    if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
      try {
        updatedCommunity = await Community.findByIdAndUpdate(
          community._id,
          { $set: { iconImageUrl } },
          { new: true }
        );

        // Approach 2 completed
      } catch (error) {
        // Error in approach 2
      }
    }

    // Approach 3: If the previous approaches didn't work, try using the raw MongoDB driver
    if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
      try {
        // Check if the connection and db are available
        if (mongoose.connection && mongoose.connection.db) {
          const result = await mongoose.connection.db
            .collection("communities")
            .findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(community._id.toString()) },
              { $set: { iconImageUrl } },
              { returnDocument: "after" }
            );

          if (result && result.value) {
            updatedCommunity = await Community.findById(community._id);
          }
        } else {
          console.error(
            "Icon API PUT: MongoDB connection not available for approach 3"
          );
        }

        // Approach 3 completed
      } catch (error) {
        console.error("Icon API PUT: Error in approach 3:", error);
      }
    }

    if (!updatedCommunity) {
      console.error("Icon API PUT: All update approaches failed");
      return NextResponse.json(
        { error: "Failed to update community icon" },
        { status: 500 }
      );
    }

    console.log(
      "Icon API PUT: Successfully updated icon URL:",
      updatedCommunity.iconImageUrl
    );
    return NextResponse.json({
      success: true,
      community: updatedCommunity,
      iconImageUrl: updatedCommunity.iconImageUrl,
    });
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: "Failed to update community icon" },
      { status: 500 }
    );
  }
}
