import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { User } from "@/models/User";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // Create headers for responses
  const responseHeaders = new Headers({
    "Cache-Control":
      "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
  });

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: responseHeaders }
      );
    }

    // Get pagination parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    // Validate and sanitize pagination parameters
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 50 ? limit : 12;
    const skip = (validPage - 1) * validLimit;

    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    await dbconnect();

    // Find the community
    const community = await Community.findOne({ slug });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404, headers: responseHeaders }
      );
    }

    // Check if the user is a member of the community
    const userId = session.user.id;
    const isMember = community.members.includes(userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You must be a member to view community members" },
        { status: 403, headers: responseHeaders }
      );
    }

    // Check if user is admin or sub-admin
    const isAdmin = community.admin === userId;
    const isSubAdmin = community.subAdmins?.includes(userId) || false;

    // Get total count of members for pagination
    const memberIds = community.members;
    const totalMembers = memberIds.length;

    // Get paginated members with their details - optimized query
    // 1. Only select fields we need
    // 2. Use lean() to get plain objects instead of Mongoose documents

    // Log the memberIds for debugging
    console.log("Member IDs:", memberIds);

    // Convert string IDs to ObjectIds if needed
    const memberObjectIds = memberIds.map((id) =>
      typeof id === "string" ? id : id.toString()
    );

    console.log("Looking up users with IDs:", memberObjectIds);

    let membersData = [];
    try {
      membersData = await User.find(
        { _id: { $in: memberObjectIds } },
        {
          // Use inclusion projection (only include these fields)
          username: 1,
          profileImage: 1,
          image: 1,
          createdAt: 1,
          _id: 1, // Explicitly include _id
        }
      )
        .sort({ createdAt: -1 }) // Sort by join date, newest first
        .skip(skip)
        .limit(validLimit)
        .lean(); // Get plain objects instead of Mongoose documents

      console.log(
        `Found ${membersData.length} members out of ${memberIds.length} IDs`
      );

      // If no members found, log more details
      if (membersData.length === 0 && memberIds.length > 0) {
        console.error(
          "No members found despite having member IDs. This might indicate an issue with ID formats or missing users."
        );

        // Try to fetch a single user to see if the database connection is working
        const anyUser = await User.findOne().lean();
        console.log("Database connection test - any user found:", !!anyUser);
      }
    } catch (findError) {
      console.error("Error finding users:", findError);
      throw new Error(
        `Error finding users: ${
          findError instanceof Error ? findError.message : String(findError)
        }`
      );
    }

    // Map members with their roles
    const membersWithRoles = membersData.map((member) => {
      const memberId = member._id.toString();
      let role = "member";

      if (memberId === community.admin) {
        role = "admin";
      } else if (community.subAdmins?.includes(memberId)) {
        role = "sub-admin";
      }

      return {
        _id: memberId,
        username: member.username,
        image: member.image || member.profileImage, // Try image first, then profileImage
        profileImage: member.profileImage, // Add profileImage field
        role,
        joinedAt: member.createdAt || new Date(),
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalMembers / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    return NextResponse.json(
      {
        members: membersWithRoles,
        isAdmin,
        isSubAdmin,
        pagination: {
          currentPage: validPage,
          totalPages,
          totalMembers,
          limit: validLimit,
          hasNextPage,
          hasPrevPage,
        },
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error fetching community members:", error);

    const errorHeaders = new Headers({
      "Cache-Control": "no-store, must-revalidate",
    });

    return NextResponse.json(
      {
        error: "Failed to fetch community members",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: errorHeaders }
    );
  }
}
