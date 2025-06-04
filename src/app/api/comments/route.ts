import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Comment } from "@/models/Comments";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbconnect();
    const postId = request.nextUrl.searchParams.get("postId");
    const parentCommentId = request.nextUrl.searchParams.get("parentCommentId");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const query: {
      postId: mongoose.Types.ObjectId;
      parentCommentId?: mongoose.Types.ObjectId | null;
    } = {
      postId: new mongoose.Types.ObjectId(postId),
    };
    if (parentCommentId) {
      query.parentCommentId = new mongoose.Types.ObjectId(parentCommentId);
    } else {
      query.parentCommentId = null;
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .populate("author", "username name profileImage");

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
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
    const { text, postId, parentCommentId } = await request.json();

    if (!text || !postId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const commentData = {
      text,
      postId: new mongoose.Types.ObjectId(postId),
      parentCommentId: parentCommentId
        ? new mongoose.Types.ObjectId(parentCommentId)
        : null,
      author: new mongoose.Types.ObjectId(session.user.id),
      authorName: user.username || user.name,
      profileImage: user.profileImage,
    };

    const newComment = await Comment.create(commentData);

    // If this is a reply to another comment, get the parent comment's author ID
    let parentAuthorId = null;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        parentAuthorId = parentComment.author.toString();
      }
    }

    // Return the new comment with parent author info if applicable
    return NextResponse.json({
      ...newComment.toObject(),
      parentAuthorId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { commentId, action } = await request.json();

    if (!commentId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    if (action === "like") {
      if (!comment.likes.includes(userId)) {
        comment.likes.push(userId);
      }
    } else if (action === "unlike") {
      comment.likes = comment.likes.filter(
        (id: string | mongoose.Types.ObjectId) =>
          id.toString() !== userId.toString()
      );
    }

    await comment.save();

    // Populate the author field for the response
    const populatedComment = await Comment.findById(commentId).populate(
      "author",
      "username name"
    );

    return NextResponse.json(populatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}
