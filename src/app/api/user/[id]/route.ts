import { getServerSession } from "@/lib/auth-helpers";
import { User } from "@/models/User";
import { Post } from "@/models/Posts";
import { dbconnect } from "@/lib/db";

import { NextRequest, NextResponse } from "next/server";
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const { id } = resolvedParams;
  console.log("params.id:", id);
  await dbconnect();

  try {
    // Verify authentication
    const id = req.url.match(/\/api\/user\/([^\/]+)/)?.[1];
    if (!id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = id as string;
    console.log("userId before validation:", userId);

    // Validate user ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    const user = await User.findById(id);
    console.log("User found:", user);
    if (!user) {
      console.log("User not found for ID:", id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch posts created by the user using the same approach as community posts
    const posts = await Post.find({ createdBy: user._id })
      .populate("communityId", "name slug")
      .sort({ createdAt: -1 });

    console.log("Found posts:", posts);
    return NextResponse.json({
      user,
      posts: posts.map((post) => ({
        _id: post._id,
        content: post.content,
        createdAt: post.createdAt,
        community: {
          name: post.communityId?.name || "Unknown Community",
          slug: post.communityId?.slug || "",
        },
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
