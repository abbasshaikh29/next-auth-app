import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    await dbconnect();

    // Find the community using multiple methods
    const results: {
      bySlug: any;
      bySlugRaw: any;
      byId: any;
      allCommunities: any[];
    } = {
      bySlug: null,
      bySlugRaw: null,
      byId: null,
      allCommunities: [],
    };

    // Method 1: Find by slug using Mongoose model
    const communityBySlug = await Community.findOne({ slug });
    if (communityBySlug) {
      results.bySlug = {
        _id: communityBySlug._id.toString(),
        name: communityBySlug.name,
        slug: communityBySlug.slug,
        iconImageUrl: communityBySlug.iconImageUrl || "",
        hasIconImageUrl: !!communityBySlug.iconImageUrl,
        iconImageUrlType: typeof communityBySlug.iconImageUrl,
        keys: Object.keys(
          communityBySlug.toJSON ? communityBySlug.toJSON() : communityBySlug
        ),
      };
    }

    // Method 2: Find by slug using raw MongoDB driver
    if (mongoose.connection && mongoose.connection.db) {
      const communityBySlugRaw = await mongoose.connection.db
        .collection("communities")
        .findOne({ slug });

      if (communityBySlugRaw) {
        results.bySlugRaw = {
          _id: communityBySlugRaw._id.toString(),
          name: communityBySlugRaw.name,
          slug: communityBySlugRaw.slug,
          iconImageUrl: communityBySlugRaw.iconImageUrl || "",
          hasIconImageUrl: !!communityBySlugRaw.iconImageUrl,
          iconImageUrlType: typeof communityBySlugRaw.iconImageUrl,
          keys: Object.keys(communityBySlugRaw),
        };
      }

      // Method 3: Find by ID if we have it from method 1
      if (communityBySlug && communityBySlug._id) {
        const communityById = await Community.findById(communityBySlug._id);
        if (communityById) {
          results.byId = {
            _id: communityById._id.toString(),
            name: communityById.name,
            slug: communityById.slug,
            iconImageUrl: communityById.iconImageUrl || "",
            hasIconImageUrl: !!communityById.iconImageUrl,
            iconImageUrlType: typeof communityById.iconImageUrl,
            keys: Object.keys(
              communityById.toJSON ? communityById.toJSON() : communityById
            ),
          };
        }
      }

      // Method 4: Get all communities to check if the community exists
      const allCommunities = await Community.find({}).limit(10);
      results.allCommunities = allCommunities.map((community) => ({
        _id: community._id.toString(),
        name: community.name,
        slug: community.slug,
        iconImageUrl: community.iconImageUrl || "",
        hasIconImageUrl: !!community.iconImageUrl,
      }));
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error debugging community:", error);
    return NextResponse.json(
      { error: "Failed to debug community" },
      { status: 500 }
    );
  }
}
