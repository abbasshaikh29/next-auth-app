import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

// PUT /api/community/[slug]/banner - Update community banner image
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bannerImageurl } = await request.json();
    console.log("Banner API PUT: Received banner URL:", bannerImageurl);

    if (!bannerImageurl) {
      return NextResponse.json(
        { error: "Banner image URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(bannerImageurl);
    } catch (e) {
      console.error("Banner API PUT: Invalid URL format:", bannerImageurl, e);
      return NextResponse.json(
        { error: "Invalid banner image URL format" },
        { status: 400 }
      );
    }

    const params = await context.params;
    const { slug } = params;

    await dbconnect();

    // Find the community first to check permissions
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or sub-admin
    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id) || false;

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Only admins can update community settings" },
        { status: 403 }
      );
    }

    // Update the banner image URL
    const updatedCommunity = await Community.findOneAndUpdate(
      { slug },
      { $set: { bannerImageurl } },
      { new: true }
    );

    if (!updatedCommunity) {
      return NextResponse.json(
        { error: "Failed to update banner image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bannerImageurl: updatedCommunity.bannerImageurl,
    });
  } catch (error) {
    console.error("Error updating banner image:", error);
    return NextResponse.json(
      { error: "Failed to update banner image" },
      { status: 500 }
    );
  }
}
