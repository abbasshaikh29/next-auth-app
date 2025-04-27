import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

interface CommunityType {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  bannerImageurl?: string;
  iconImageUrl?: string;
  members: string[];
  admin: string;
  subAdmins?: string[];
  adminQuestions?: string[];
}

// In Next.js 15, the params object is a Promise
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;
    console.log("Main Community API: Fetching community for slug:", slug);

    // Add cache control headers to prevent caching
    const headers = new Headers({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    if (!slug) {
      return NextResponse.json(
        { error: "Invalid slug parameter" },
        { status: 400, headers }
      );
    }

    await dbconnect();

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        {
          error: "Database connection not ready",
          details: { readyState: mongoose.connection.readyState },
        },
        { status: 500, headers }
      );
    }

    // Use lean() to get a plain JavaScript object instead of a Mongoose document
    const communityDoc = await Community.findOne({
      slug,
    });

    // Convert to plain object and cast to our type
    const community: CommunityType | null = communityDoc
      ? {
          _id: communityDoc._id.toString(),
          name: communityDoc.name,
          slug: communityDoc.slug || "",
          description: communityDoc.description,
          bannerImageurl: communityDoc.bannerImageurl,
          iconImageUrl: communityDoc.iconImageUrl,
          members: communityDoc.members || [],
          admin: communityDoc.admin || "",
          subAdmins: communityDoc.subAdmins || [],
          adminQuestions: communityDoc.adminQuestions || [],
        }
      : null;

    if (!community) {
      // Try to find if any communities exist
      const communityCount = await Community.countDocuments({});

      return NextResponse.json(
        {
          error: "Community not found",
          details: {
            slug,
            communityCount,
            databaseName: mongoose.connection.db?.databaseName || "unknown",
          },
        },
        { status: 404, headers }
      );
    }

    console.log("Main Community API: Community found:", {
      id: community._id,
      name: community.name,
      iconImageUrl: community.iconImageUrl || "<empty>",
      membersCount: community.members?.length || 0,
      hasMembers: !!community.members,
      firstFewMembers: community.members?.slice(0, 3) || [],
    });

    // Validate the icon URL
    let iconImageUrl = community.iconImageUrl || "";
    if (iconImageUrl && iconImageUrl.trim() !== "") {
      try {
        // Validate URL format
        new URL(iconImageUrl);
      } catch (e) {
        console.error(
          "Main Community API: Invalid URL format:",
          iconImageUrl,
          e
        );
        iconImageUrl = "";
      }
    }

    // Make sure iconImageUrl is explicitly set
    const responseData = {
      ...community,
      iconImageUrl,
      timestamp: Date.now(),
    };

    return NextResponse.json(responseData, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch community",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
