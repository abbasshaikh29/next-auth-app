import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authoptions";
import { dbconnect } from "@/lib/db";
import { Post, IPost } from "@/models/Posts";
import { Community } from "@/models/Community";
import mongoose from "mongoose";
import { User } from "@/models/User";

interface PostWithAuthor extends IPost {
  authorName: string;
}
export async function GET(request: NextRequest) {
  try {
    await dbconnect();

    // Extract community slug from the query parameters
    const communitySlug = request.nextUrl.searchParams.get("communitySlug");

    if (!communitySlug) {
      return NextResponse.json(
        { error: "Missing communitySlug" },
        { status: 400 }
      );
    }

    // Find community by slug first
    const community = await Community.findOne({ slug: communitySlug });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Modify the query to filter by community ID
    const posts = await Post.find({ communityId: community._id }).populate(
      "createdBy",
      "name"
    );

    if (!posts || posts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const postsWithAuthor = posts.map((post: any) => {
      let parsedContent;
      if (typeof post.content === "string") {
        try {
          parsedContent = JSON.parse(post.content);
        } catch (e) {
          console.error("Failed to parse content", post.content);
          parsedContent = [];
        }
      } else {
        parsedContent = post.content;
      }
      return {
        ...post.toObject(),
        content: parsedContent,
      };
    });

    return NextResponse.json(postsWithAuthor);
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Failed to fetch community" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    let processedContent = content;
    try {
      // Validate that content is valid JSON if it's a string
      if (typeof content === "string") {
        JSON.parse(content); // This will throw if invalid JSON
      }
    } catch (e) {
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

    const newPost = await Post.create(postData);
    return NextResponse.json(newPost);
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
