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

    // Debug the request body
    console.log("Request body:", {
      name,
      description,
      bannerImageurl,
      iconImageUrl,
    });

    // Validate icon image URL
    if (iconImageUrl) {
      console.log("Icon image URL is present in request:", iconImageUrl);
      console.log("Icon image URL type:", typeof iconImageUrl);
    } else {
      console.log("No icon image URL in request");
    }

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
    console.log("Current name:", community.name);
    console.log("New name:", name);
    console.log("Name changed:", nameChanged);

    if (nameChanged) {
      // If name changed, generate a new slug
      const oldSlug = community.slug;
      const newSlug = generateSlug(name);
      console.log("Old slug:", oldSlug);
      console.log("Generated new slug:", newSlug);

      console.log("Attempting to update community with new slug:", newSlug);
      console.log("Icon image URL being saved:", iconImageUrl);

      // Create the update object with all fields
      const updateObj = {
        name,
        description,
        bannerImageurl: bannerImageurl,
        iconImageUrl: iconImageUrl,
        slug: newSlug,
      };

      console.log("Full update object:", updateObj);

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

        console.log("Update result (approach 1):", updatedCommunity);
        console.log(
          "Icon image URL after update (approach 1):",
          updatedCommunity?.iconImageUrl
        );
      } catch (error) {
        console.error("Error in update approach 1:", error);
      }

      // Approach 2: If the first approach didn't work, try updating by ID
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        console.log(
          "First update approach didn't save icon image URL, trying by ID"
        );

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

            console.log("Update result (approach 2):", updatedCommunity);
            console.log(
              "Icon image URL after update (approach 2):",
              updatedCommunity?.iconImageUrl
            );
          }
        } catch (error) {
          console.error("Error in update approach 2:", error);
        }
      }

      // Approach 3: If the previous approaches didn't work, try using the raw MongoDB driver with ID
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        console.log(
          "Previous update approaches didn't save icon image URL, trying raw MongoDB driver with ID"
        );

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

            console.log("Update result (approach 3):", updatedCommunity);
            console.log(
              "Icon image URL after update (approach 3):",
              updatedCommunity?.iconImageUrl
            );
          }
        } catch (error) {
          console.error("Error in update approach 3:", error);
        }
      }

      console.log("Updated community:", updatedCommunity);
      console.log("New slug after update:", updatedCommunity?.slug);

      // If the updatedCommunity is null or the slug wasn't updated correctly, try a direct update
      if (!updatedCommunity || updatedCommunity.slug !== newSlug) {
        console.log("Slug not updated correctly, trying direct update");

        // Use the MongoDB driver directly to update the slug
        // Try multiple approaches to ensure the update works
        try {
          // Approach 1: Using Community.collection
          const directResult = await Community.collection.updateOne(
            { slug: slug },
            { $set: { slug: newSlug } }
          );
          console.log("Direct update result (approach 1):", directResult);

          // Approach 2: Using mongoose connection directly
          if (directResult.modifiedCount === 0) {
            const directResult2 = await mongoose.connection.db
              .collection("communities")
              .updateOne({ slug: slug }, { $set: { slug: newSlug } });
            console.log("Direct update result (approach 2):", directResult2);
          }

          // Approach 3: Update by ID if we have the community object
          if (community && community._id) {
            const directResult3 = await Community.findByIdAndUpdate(
              community._id,
              { $set: { slug: newSlug } },
              { new: true }
            );
            console.log("Direct update result (approach 3):", directResult3);
          }
        } catch (error) {
          console.error("Error during direct update:", error);
        }

        // Fetch the updated document using multiple approaches
        let updatedDoc = null;

        // Try to find by name first
        updatedDoc = await Community.findOne({ name: name });
        console.log("Updated document found by name:", updatedDoc);

        // If not found by name, try to find by new slug
        if (!updatedDoc) {
          updatedDoc = await Community.findOne({ slug: newSlug });
          console.log("Updated document found by new slug:", updatedDoc);
        }

        // If not found by new slug, try to find by ID
        if (!updatedDoc && community && community._id) {
          updatedDoc = await Community.findById(community._id);
          console.log("Updated document found by ID:", updatedDoc);
        }

        if (updatedDoc) {
          console.log("Final updated document:", updatedDoc);
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
      console.log("Name hasn't changed, updating other fields");
      console.log("Icon image URL being saved:", iconImageUrl);

      // Create the update object with all fields except name and slug
      const updateObj = {
        description,
        bannerImageurl: bannerImageurl,
        iconImageUrl: iconImageUrl,
      };

      console.log("Update object for unchanged name:", updateObj);

      // Try multiple approaches to ensure the update works
      let updatedCommunity;

      // Approach 1: Use findOneAndUpdate with the slug
      updatedCommunity = await Community.findOneAndUpdate(
        { slug },
        { $set: updateObj },
        { new: true }
      );

      console.log("Update result (approach 1):", updatedCommunity);

      // Approach 2: If the first approach didn't work, try updating by ID
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        console.log(
          "First update approach didn't save icon image URL, trying by ID"
        );

        if (community && community._id) {
          updatedCommunity = await Community.findByIdAndUpdate(
            community._id,
            { $set: updateObj },
            { new: true }
          );

          console.log("Update result (approach 2):", updatedCommunity);
        }
      }

      // Approach 3: If the previous approaches didn't work, try using the raw MongoDB driver
      if (!updatedCommunity || !updatedCommunity.iconImageUrl) {
        console.log(
          "Previous update approaches didn't save icon image URL, trying raw MongoDB driver"
        );

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

          console.log("Update result (approach 3):", updatedCommunity);
        }
      }

      console.log("Updated community (unchanged name):", updatedCommunity);
      console.log(
        "Icon image URL after update:",
        updatedCommunity?.iconImageUrl
      );

      return NextResponse.json(updatedCommunity);
    }
  } catch (error) {
    console.error("Error updating community:", error);
    return NextResponse.json(
      { error: "Failed to update community" },
      { status: 500 }
    );
  }
}
