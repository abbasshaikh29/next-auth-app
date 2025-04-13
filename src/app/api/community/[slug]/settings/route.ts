import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { name, description, bannerImageurl } = await request.json();
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    await dbconnect();

    const updatedCommunity = await Community.findOneAndUpdate(
      { slug },
      { $set: { name, description, bannerImageurl } },
      { new: true }
    );

    if (!updatedCommunity) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCommunity);
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json(
      { error: "Failed to update community" },
      { status: 500 }
    );
  }
}
