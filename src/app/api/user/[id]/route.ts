import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { Post } from "@/models/Posts";
import { dbconnect } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  await dbconnect();

  try {
    console.log("Fetching user with ID:", params.id);

    // Fetch user data
    const user = await User.findById(params.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", params.id);
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
