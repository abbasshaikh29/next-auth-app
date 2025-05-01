import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Post } from "@/models/Posts";
import { Community } from "@/models/Community";
import mongoose from "mongoose";
import { User } from "@/models/User";

export async function GET(request: NextRequest) {
  // Create headers for responses
  const responseHeaders = new Headers({
    "Cache-Control":
      "public, max-age=5, s-maxage=15, stale-while-revalidate=30",
  });

  const errorHeaders = new Headers({
    "Cache-Control": "no-store, must-revalidate",
  });

  try {
    await dbconnect();

    // Extract community slug from the query parameters
    const communitySlug = request.nextUrl.searchParams.get("communitySlug");

    if (!communitySlug) {
      return NextResponse.json(
        { error: "Missing communitySlug" },
        { status: 400, headers: responseHeaders }
      );
    }

    // Find community by slug first - optimized query
    const community = await Community.findOne({ slug: communitySlug })
      .select("_id") // Only select the _id field since that's all we need
      .lean();

    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404, headers: responseHeaders }
      );
    }

    // Query posts by community ID and sort by createdAt in descending order (newest first)
    const posts = await Post.find({ communityId: community._id })
      .select("title content createdBy createdAt authorName")
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profileImage")
      .lean();

    if (!posts || posts.length === 0) {
      return NextResponse.json([], { status: 200, headers: responseHeaders });
    }

    const postsWithAuthor = posts.map((post: any) => {
      let parsedContent;
      if (typeof post.content === "string") {
        try {
          parsedContent = JSON.parse(post.content);
        } catch (error) {
          console.error("Failed to parse content", post.content);
          parsedContent = [];
        }
      } else {
        parsedContent = post.content;
      }

      // Get the profile image from the populated createdBy field
      const profileImage =
        post.createdBy &&
        typeof post.createdBy === "object" &&
        "profileImage" in post.createdBy
          ? post.createdBy.profileImage
          : undefined;

      // Since we're using .lean(), post is already a plain object and doesn't have toObject()
      return {
        ...post,
        content: parsedContent,
        profileImage: profileImage,
      };
    });

    return NextResponse.json(postsWithAuthor, { headers: responseHeaders });
  } catch (error) {
    console.error("Error in GET /api/community/posts:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500, headers: errorHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { title, content, communitySlug } = await request.json();

    // Validate required fields
    if (!title || !content || !communitySlug) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${[
            !title && "title",
            !content && "content",
            !communitySlug && "communitySlug",
          ]
            .filter(Boolean)
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const processedContent = content;
    try {
      // Validate that content is valid JSON if it's a string
      if (typeof content === "string") {
        JSON.parse(content); // This will throw if invalid JSON
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid content format" },
        { status: 400 }
      );
    }

    // Find community by slug
    const community = await Community.findOne({ slug: communitySlug });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const postData = {
      title,
      content: processedContent,
      authorName: user.username || user.name,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      communityId: community._id,
    };

    // Create the post
    const newPost = await Post.create(postData);

    // Return the post with profile image
    return NextResponse.json({
      ...newPost.toObject(),
      profileImage: user.profileImage,
    });
  } catch (error: any) {
    console.error("Error creating post:", error);

    const errorHeaders = new Headers({
      "Cache-Control": "no-store, must-revalidate",
    });

    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500, headers: errorHeaders }
    );
  }
}
