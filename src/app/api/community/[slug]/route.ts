import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

interface CommunityType {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  bannerImageurl?: string;
  iconImageUrl?: string;
  // Add other fields as needed
}

// In Next.js 15, the params object is a Promise
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    await dbconnect();
    const community: CommunityType | null = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    console.log("Community data from API:", community);
    console.log("Icon image URL:", community.iconImageUrl);
    console.log("Community data keys:", Object.keys(community));
    console.log("Community data type:", typeof community);

    // Convert to plain object and ensure iconImageUrl is included
    const communityObj = community.toJSON ? community.toJSON() : community;

    // Make sure iconImageUrl is explicitly set
    const responseData = {
      ...communityObj,
      iconImageUrl: community.iconImageUrl || "",
    };

    console.log("Response data:", responseData);
    console.log("Response data keys:", Object.keys(responseData));
    console.log("Final icon image URL in response:", responseData.iconImageUrl);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Failed to fetch community" },
      { status: 500 }
    );
  }
}
