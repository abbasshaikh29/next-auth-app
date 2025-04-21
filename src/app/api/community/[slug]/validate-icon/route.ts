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

    await dbconnect();

    // Find the community
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    console.log("Community found in validate-icon API:", community);
    console.log("Icon image URL in validate-icon API:", community.iconImageUrl);

    // Check if the icon image URL exists
    const iconImageUrl = community.iconImageUrl || "";
    const isValid = iconImageUrl.trim() !== "";

    return NextResponse.json({
      success: true,
      iconImageUrl,
      isValid,
    });
  } catch (error) {
    console.error("Error validating community icon:", error);
    return NextResponse.json(
      { error: "Failed to validate community icon" },
      { status: 500 }
    );
  }
}
