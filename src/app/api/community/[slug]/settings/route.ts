import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community, generateSlug } from "@/models/Community";
import { getServerSession } from "@/lib/auth-helpers";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, bannerImageurl, iconImageUrl } =
      await request.json();

    const resolvedParams = await context.params;
    const { slug } = resolvedParams;

    await dbconnect();

    // Find the community first to check permissions
    const community = await Community.findOne({ slug });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if the user is an admin or sub-admin
    const userId = session.user.id;
    const isAdmin = community.admin === userId;
    const isSubAdmin = community.subAdmins?.includes(userId) || false;

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Only admins and sub-admins can update community settings" },
        { status: 403 }
      );
    }

    // Check if the name has changed
    const nameChanged = community.name !== name;

    if (nameChanged) {
      // If name changed, generate a new slug
      const oldSlug = community.slug;
      const newSlug = generateSlug(name);

      // Create the update object with all fields
      const updateObj = {
        name,
        description,
        bannerImageurl: bannerImageurl,
        iconImageUrl: iconImageUrl,
        slug: newSlug,
      };

      // Try multiple approaches to ensure the update works
      let updatedCommunity = null;

      // Approach 1: Use the raw MongoDB driver
      try {
        const result = await Community.collection.findOneAndUpdate(
          { slug: slug },
          { $set: updateObj },
          { returnDocument: "after" }
        );

        // Get the updated document
        if (result.value) {
          updatedCommunity = await Community.findById(result.value._id);
        }

        // Approach 1 completed
      } catch (error) {
        // Error in approach 1
      }

      // Approach 2: If the first approach didn't work, try updating by ID
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        try {
          if (community && community._id) {
            const updatedDoc = await Community.findByIdAndUpdate(
              community._id,
              { $set: updateObj },
              { new: true }
            );

            if (updatedDoc) {
              updatedCommunity = updatedDoc;
            }

            // Approach 2 completed
          }
        } catch (error) {
          // Error in approach 2
        }
      }

      // Approach 3: If the previous approaches didn't work, try using the raw MongoDB driver with ID
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        try {
          if (community && community._id) {
            const result = await mongoose.connection.db
              .collection("communities")
              .findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(community._id.toString()) },
                { $set: updateObj },
                { returnDocument: "after" }
              );

            if (result.value) {
              updatedCommunity = await Community.findById(community._id);
            }

            // Approach 3 completed
          }
        } catch (error) {
          // Error in approach 3
        }
      }

      // If the updatedCommunity is null or the slug wasn't updated correctly, try a direct update
      if (!updatedCommunity || updatedCommunity.slug !== newSlug) {
        // Use the MongoDB driver directly to update the slug
        // Try multiple approaches to ensure the update works
        try {
          // Approach 1: Using Community.collection
          const directResult = await Community.collection.updateOne(
            { slug: slug },
            { $set: { slug: newSlug } }
          );

          // Approach 2: Using mongoose connection directly
          if (directResult.modifiedCount === 0) {
            const directResult2 = await mongoose.connection.db
              .collection("communities")
              .updateOne({ slug: slug }, { $set: { slug: newSlug } });
          }

          // Approach 3: Update by ID if we have the community object
          if (community && community._id) {
            const directResult3 = await Community.findByIdAndUpdate(
              community._id,
              { $set: { slug: newSlug } },
              { new: true }
            );
          }
        } catch (error) {
          // Error during direct update
        }

        // Fetch the updated document using multiple approaches
        let updatedDoc = null;

        // Try to find by name first
        updatedDoc = await Community.findOne({ name: name });

        // If not found by name, try to find by new slug
        if (!updatedDoc) {
          updatedDoc = await Community.findOne({ slug: newSlug });
        }

        // If not found by new slug, try to find by ID
        if (!updatedDoc && community && community._id) {
          updatedDoc = await Community.findById(community._id);
        }

        if (updatedDoc) {
          return NextResponse.json({
            ...updatedDoc.toJSON(),
            nameChanged: true,
            oldSlug: slug,
            newSlug: updatedDoc.slug || newSlug, // Use the generated slug if document slug is still null
          });
        }
      }

      if (!updatedCommunity) {
        return NextResponse.json(
          { error: "Failed to update community" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ...updatedCommunity.toJSON(),
        nameChanged: true,
        oldSlug: slug,
        newSlug: updatedCommunity.slug,
      });
    } else {
      // If name hasn't changed, use findOneAndUpdate as before

      // Create the update object with all fields except name and slug
      const updateObj = {
        description,
        bannerImageurl: bannerImageurl,
        iconImageUrl: iconImageUrl,
      };

      // Try multiple approaches to ensure the update works
      let updatedCommunity;

      // Approach 1: Use findOneAndUpdate with the slug
      updatedCommunity = await Community.findOneAndUpdate(
        { slug },
        { $set: updateObj },
        { new: true }
      );

      // Approach 2: If the first approach didn't work, try updating by ID
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        if (community && community._id) {
          updatedCommunity = await Community.findByIdAndUpdate(
            community._id,
            { $set: updateObj },
            { new: true }
          );
        }
      }

      // Approach 3: If the previous approaches didn't work, try using the raw MongoDB driver
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        if (community && community._id) {
          const result = await mongoose.connection.db
            .collection("communities")
            .findOneAndUpdate(
              { _id: new mongoose.Types.ObjectId(community._id) },
              { $set: updateObj },
              { returnDocument: "after" }
            );

          if (result.value) {
            updatedCommunity = await Community.findById(community._id);
          }
        }
      }

      return NextResponse.json(updatedCommunity);
    }
  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: "Failed to update community" },
      { status: 500 }
    );
  }
}
