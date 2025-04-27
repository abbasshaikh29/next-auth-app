import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Post } from "@/models/Posts";
import mongoose from "mongoose";

// Edit a post
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { postId, title, content } = await request.json();

    if (!postId || !title || !content) {
      return NextResponse.json(
        { error: "Post ID, title, and content are required" },
        { status: 400 }
      );
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user is the author of the post
    if (post.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own posts" },
        { status: 403 }
      );
    }

    // Validate content format if it's a string
    if (typeof content === "string") {
      try {
        JSON.parse(content); // This will throw if invalid JSON
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid content format" },
          { status: 400 }
        );
      }
    }

    // Update the post
    post.title = title;
    post.content = content;
    await post.save();

    return NextResponse.json({
      success: true,
      post: {
        ...post.toObject(),
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        content: typeof content === "string" ? JSON.parse(content) : content,
      },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user is the author of the post
    if (post.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own posts" },
        { status: 403 }
      );
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
