import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { getServerSession } from "@/lib/auth-helpers";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { slug } = resolvedParams;
    const { memberId } = await request.json();

    await dbconnect();
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if the user is the admin
    if (community.admin !== session.user?.id) {
      return NextResponse.json(
        { error: "Only admins can add sub-admins" },
        { status: 403 }
      );
    }

    // Check if the member exists in the community
    if (!community.members.includes(memberId)) {
      return NextResponse.json(
        { error: "User is not a member of this community" },
        { status: 400 }
      );
    }

    // Add member to subAdmins array if not already there
    if (!community.subAdmins?.includes(memberId)) {
      community.subAdmins = [...(community.subAdmins || []), memberId];
      await community.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding sub-admin:", error);
    return NextResponse.json(
      { error: "Failed to add sub-admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { slug } = resolvedParams;
    const { memberId } = await request.json();

    await dbconnect();
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if the user is the admin
    if (community.admin !== session.user?.id) {
      return NextResponse.json(
        { error: "Only admins can remove sub-admins" },
        { status: 403 }
      );
    }

    // Remove member from subAdmins array if they are a sub-admin
    if (community.subAdmins?.includes(memberId)) {
      community.subAdmins = community.subAdmins.filter(
        (id: string) => id !== memberId
      );
      await community.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing sub-admin:", error);
    return NextResponse.json(
      { error: "Failed to remove sub-admin" },
      { status: 500 }
    );
  }
}
