import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community, generateSlug } from "@/models/Community";
import { getServerSession } from "@/lib/auth-helpers";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, newName } = await request.json();

    if (!communityId || !newName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find the community first to check permissions
    const community = await Community.findById(communityId);

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

    // Generate new slug
    const oldSlug = community.slug;
    const newSlug = generateSlug(newName);

    console.log("Old slug:", oldSlug);
    console.log("New slug:", newSlug);

    // Update the community with the new name and slug
    let result;

    // Check if mongoose connection is available
    if (mongoose.connection && mongoose.connection.db) {
      // Use updateOne with raw MongoDB driver for more direct control
      result = await mongoose.connection.db
        .collection("communities")
        .updateOne(
          { _id: new mongoose.Types.ObjectId(communityId) },
          { $set: { name: newName, slug: newSlug } }
        );
    } else {
      // Fallback to using Mongoose model
      result = await Community.updateOne(
        { _id: communityId },
        { $set: { name: newName, slug: newSlug } }
      );
    }

    console.log("Update result:", result);

    // Verify the update
    const updatedCommunity = await Community.findById(communityId);
    console.log("Updated community:", updatedCommunity);

    if (!updatedCommunity || updatedCommunity.slug !== newSlug) {
      return NextResponse.json(
        { error: "Failed to update slug" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      oldSlug,
      newSlug,
      community: updatedCommunity,
    });
  } catch (error) {
    console.error("Error updating slug:", error);
    return NextResponse.json(
      { error: "Failed to update slug" },
      { status: 500 }
    );
  }
}
