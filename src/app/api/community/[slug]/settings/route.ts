import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { getServerSession } from "@/lib/auth-helpers";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, bannerImageurl } = await request.json();
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

    // Update the community
    const updatedCommunity = await Community.findOneAndUpdate(
      { slug },
      { $set: { name, description, bannerImageurl } },
      { new: true }
    );

    return NextResponse.json(updatedCommunity);
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json(
      { error: "Failed to update community" },
      { status: 500 }
    );
  }
}
