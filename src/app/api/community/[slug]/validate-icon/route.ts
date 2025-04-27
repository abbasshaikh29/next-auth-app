import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;
    console.log("Validate-icon API: Fetching icon for slug:", slug);

    // Add cache control headers to prevent caching
    const headers = new Headers({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    await dbconnect();

    // Find the community with a fresh query
    const communityDoc = await Community.findOne({ slug });

    if (!communityDoc) {
      console.log("Validate-icon API: Community not found for slug:", slug);
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404, headers }
      );
    }

    // Convert to plain object for safe access
    const community = communityDoc.toObject();

    console.log("Validate-icon API: Community found:", {
      id: community._id.toString(),
      name: community.name,
      iconImageUrl: community.iconImageUrl || "<empty>",
    });

    // Check if the icon image URL exists and is valid
    let iconImageUrl = community.iconImageUrl || "";
    let isValid = false;

    if (iconImageUrl && iconImageUrl.trim() !== "") {
      try {
        // Validate URL format
        new URL(iconImageUrl);
        isValid = true;
      } catch (e) {
        console.error(
          "Validate-icon API: Invalid URL format:",
          iconImageUrl,
          e
        );
        iconImageUrl = "";
      }
    }

    return NextResponse.json(
      {
        success: true,
        iconImageUrl,
        isValid,
        timestamp: Date.now(),
      },
      { headers }
    );
  } catch (error) {
    console.error("Error validating community icon:", error);
    return NextResponse.json(
      { error: "Failed to validate community icon" },
      { status: 500 }
    );
  }
}
