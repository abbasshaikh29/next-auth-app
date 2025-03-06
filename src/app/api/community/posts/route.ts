import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authoption } from "@/lib/authoptions";
import { dbconnect } from "@/lib/db";
import { Post, IPost } from "@/models/Posts";
import mongoose from "mongoose";
import { User } from "@/models/User";

interface PostWithAuthor extends IPost {
  authorName: string;
}
export async function GET(request: NextRequest) {
  try {
    await dbconnect();

    // Extract community ID from the query parameters
    const communityId = request.nextUrl.searchParams.get("communityId");

    if (!communityId) {
      return NextResponse.json(
        { error: "Missing communityId" },
        { status: 400 }
      );
    }

    // Modify the query to filter by community ID
    const posts = await Post.find({ communityId }).populate(
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
        authorName: post.createdBy ? post.createdBy.name : "Unknown Author",
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
    const session = await getServerSession(authoption);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { title, content, communityId } = await request.json();

    // Validate required fields
    if (!title || !content || !communityId) {
      return NextResponse.json(
        {
          error: `Missing required fields: ${[
            !title && "title",
            !content && "content",
            !communityId && "communityId",
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

    const postData = {
      title,
      content: processedContent,
      authorName: user.username || user.name,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
      communityId: new mongoose.Types.ObjectId(communityId),
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
