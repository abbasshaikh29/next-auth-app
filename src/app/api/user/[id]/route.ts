import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";
import { User } from "@/models/User";
import { Post } from "@/models/Posts";
import { dbconnect } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbconnect();

  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate user ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log("User not found for ID:", userId);
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
