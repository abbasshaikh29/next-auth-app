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

    await dbconnect();

    // Find the community
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    console.log("Community found in icon GET API:", community);
    console.log("Icon image URL in GET API:", community.iconImageUrl);

    return NextResponse.json({
      success: true,
      iconImageUrl: community.iconImageUrl || "",
    });
  } catch (error) {
    console.error("Error fetching community icon:", error);
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
    console.log("Icon image URL in direct update API:", iconImageUrl);

    if (!iconImageUrl) {
      return NextResponse.json(
        { error: "Icon image URL is required" },
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

    console.log("Community found:", community);
    console.log("Community ID:", community._id);

    // Try multiple approaches to update the icon image URL
    let updatedCommunity = null;

    // Approach 1: Use findOneAndUpdate with the slug
    try {
      updatedCommunity = await Community.findOneAndUpdate(
        { slug },
        { $set: { iconImageUrl } },
        { new: true }
      );

      console.log("Update result (approach 1):", updatedCommunity);
      console.log(
        "Icon image URL after update (approach 1):",
        updatedCommunity?.iconImageUrl
      );
    } catch (error) {
      console.error("Error in update approach 1:", error);
    }

    // Approach 2: If the first approach didn't work, try updating by ID
    if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
      console.log(
        "First update approach didn't save icon image URL, trying by ID"
      );

      try {
        updatedCommunity = await Community.findByIdAndUpdate(
          community._id,
          { $set: { iconImageUrl } },
          { new: true }
        );

        console.log("Update result (approach 2):", updatedCommunity);
        console.log(
          "Icon image URL after update (approach 2):",
          updatedCommunity?.iconImageUrl
        );
      } catch (error) {
        console.error("Error in update approach 2:", error);
      }
    }

    // Approach 3: If the previous approaches didn't work, try using the raw MongoDB driver
    if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
      console.log(
        "Previous update approaches didn't save icon image URL, trying raw MongoDB driver"
      );

      try {
        const result = await mongoose.connection.db
          .collection("communities")
          .findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(community._id.toString()) },
            { $set: { iconImageUrl } },
            { returnDocument: "after" }
          );

        if (result.value) {
          updatedCommunity = await Community.findById(community._id);
        }

        console.log("Update result (approach 3):", updatedCommunity);
        console.log(
          "Icon image URL after update (approach 3):",
          updatedCommunity?.iconImageUrl
        );
      } catch (error) {
        console.error("Error in update approach 3:", error);
      }
    }

    if (!updatedCommunity) {
      return NextResponse.json(
        { error: "Failed to update community icon" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      community: updatedCommunity,
      iconImageUrl: updatedCommunity.iconImageUrl,
    });
  } catch (error) {
    console.error("Error updating community icon:", error);
    return NextResponse.json(
      { error: "Failed to update community icon" },
      { status: 500 }
    );
  }
}
