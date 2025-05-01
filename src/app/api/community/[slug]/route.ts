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

    // Add cache control headers with stale-while-revalidate strategy
    // This allows the browser to use a cached version while fetching a new one in the background
    const headers = new Headers({
      "Cache-Control":
        "public, max-age=10, s-maxage=30, stale-while-revalidate=60",
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

    // Optimized query:
    // 1. Use lean() to get a plain JavaScript object instead of a Mongoose document
    // 2. Only select the fields we need
    // 3. Add proper indexing hint
    const communityDoc = await Community.findOne({
      slug,
    })
      .select(
        "_id name slug description bannerImageurl iconImageUrl members admin subAdmins adminQuestions"
      )
      .lean()
      .hint({ slug: 1 }); // Use the slug index for better performance

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

    // Community found, continue with processing

    // Validate the icon URL
    let iconImageUrl = community.iconImageUrl || "";
    if (iconImageUrl && iconImageUrl.trim() !== "") {
      try {
        // Validate URL format
        new URL(iconImageUrl);
      } catch (e) {
        // Invalid URL format, reset to empty string
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
