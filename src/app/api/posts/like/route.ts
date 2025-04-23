import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Post } from "@/models/Posts";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { postId, action } = await request.json();

    if (!postId || !action) {
      return NextResponse.json(
        { error: "Post ID and action are required" },
        { status: 400 }
      );
    }

    // Validate action
    if (action !== "like" && action !== "unlike") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'like' or 'unlike'" },
        { status: 400 }
      );
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Update likes based on action
    if (action === "like") {
      // Check if user already liked the post
      const alreadyLiked = post.likes.some(
        (id: mongoose.Types.ObjectId) => id.toString() === userId.toString()
      );

      if (!alreadyLiked) {
        post.likes.push(userId);
      }
    } else {
      // Unlike: Remove user ID from likes array
      post.likes = post.likes.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== userId.toString()
      );
    }

    await post.save();

    return NextResponse.json({
      success: true,
      likes: post.likes,
      likeCount: post.likes.length,
    });
  } catch (error) {
    console.error("Error updating post likes:", error);
    return NextResponse.json(
      { error: "Failed to update post likes" },
      { status: 500 }
    );
  }
}
