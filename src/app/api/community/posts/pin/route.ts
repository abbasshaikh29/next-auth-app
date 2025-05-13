import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Post } from "@/models/Posts";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// POST /api/community/posts/pin - Pin or unpin a post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { postId, communityId, isPinned } = await request.json();

    if (!postId || !communityId) {
      return NextResponse.json(
        { error: "Post ID and Community ID are required" },
        { status: 400 }
      );
    }

    // Find the community
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or sub-admin
    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id);

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Only admins and sub-admins can pin posts" },
        { status: 403 }
      );
    }

    // Find and update the post
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the post belongs to the specified community
    if (post.communityId.toString() !== communityId) {
      return NextResponse.json(
        { error: "Post does not belong to the specified community" },
        { status: 400 }
      );
    }

    // Update the post's pinned status
    post.isPinned = isPinned === true;
    await post.save();

    // If the post is being pinned, create notifications for all community members
    if (isPinned === true) {
      try {
        // Create notifications for all community members
        await fetch(`${request.nextUrl.origin}/api/notifications/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "admin-post",
            title: "Admin pinned a post",
            content: post.title,
            sourceId: post._id,
            sourceType: "post",
            communityId,
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
        _id: post._id,
        isPinned: post.isPinned,
      },
    });
  } catch (error) {
    console.error("Error pinning/unpinning post:", error);
    return NextResponse.json(
      { error: "Failed to update post pin status" },
      { status: 500 }
    );
  }
}
