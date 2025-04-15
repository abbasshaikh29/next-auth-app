import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { User } from "@/models/User";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Check if the user is a member of the community
    const userId = session.user.id;
    const isMember = community.members.includes(userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member to view community members" },
        { status: 403 }
      );
    }

    // Check if user is admin or sub-admin
    const isAdmin = community.admin === userId;
    const isSubAdmin = community.subAdmins?.includes(userId) || false;

    // Get all members with their details
    const memberIds = community.members;
    const membersData = await User.find(
      { _id: { $in: memberIds } },
      { password: 0 } // Exclude password field
    );

    // Map members with their roles
    const membersWithRoles = membersData.map((member) => {
      let role = "member";
      if (member._id.toString() === community.admin) {
        role = "admin";
      } else if (community.subAdmins?.includes(member._id.toString())) {
        role = "sub-admin";
      }

      return {
        _id: member._id,
        username: member.username,
        image: member.image || member.profileImage, // Try image first, then profileImage
        profileImage: member.profileImage, // Add profileImage field
        role,
        joinedAt: member.createdAt || new Date(),
      };
    });

    return NextResponse.json({
      members: membersWithRoles,
      isAdmin,
      isSubAdmin,
    });
  } catch (error) {
    console.error("Error fetching community members:", error);
    return NextResponse.json(
      { error: "Failed to fetch community members" },
      { status: 500 }
    );
  }
}
