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
    const { postId, title, content, notifyMembers } = await request.json();

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

    // If notifyMembers is true, create notifications for all community members
    if (notifyMembers === true) {
      try {
        // Get the origin for absolute URLs
        const origin =
          request.headers.get("origin") || request.headers.get("host") || "";
        const protocol = origin.startsWith("localhost")
          ? "http://"
          : "https://";
        const baseUrl = origin.startsWith("http")
          ? origin
          : `${protocol}${origin}`;

        // Create notifications for community members
        await fetch(`${baseUrl}/api/notifications/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "post",
            title: "Post updated in your community",
            content: title,
            sourceId: post._id,
            sourceType: "post",
            communityId: post.communityId,
          }),
        });
      } catch (notificationError) {
        console.error("Error creating notifications:", notificationError);
        // Continue even if notification creation fails
      }
    }

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

    // Get the origin for absolute URLs
    const origin =
      request.headers.get("origin") || request.headers.get("host") || "";
    const protocol = origin.startsWith("localhost") ? "http://" : "https://";
    const baseUrl = origin.startsWith("http") ? origin : `${protocol}${origin}`;

    // Try to emit a socket event for real-time updates
    try {
      // Prepare the event data
      const eventData = {
        postId,
        userId: session.user.id,
        userName: session.user.name || "A user",
        communityId: post.communityId,
      };

      // Try to emit using the socket API
      await fetch(`${baseUrl}/api/socket/emit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "post-deleted",
          room: `community:${post.communityId}`,
          data: eventData,
        }),
      });

      console.log(`Emitted post-deleted event for post ${postId}`);
    } catch (socketError) {
      console.error("Error with socket emission:", socketError);
      // Continue even if socket emission fails - the post will still be deleted
    }

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
      postId: postId,
      communityId: post.communityId,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
