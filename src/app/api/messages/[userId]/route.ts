import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";
import mongoose from "mongoose";

// Get messages between current user and specified user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const params = await context.params;
    const otherUserId = new mongoose.Types.ObjectId(params.userId);
    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "_id username profileImage") // Populate sender information
      .lean();

    // Mark messages as read with timestamp
    const now = new Date();
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: currentUserId,
        read: false,
      },
      { $set: { read: true, readAt: now } }
    );

    // Reset unread count for current user in conversation
    await Conversation.findOneAndUpdate(
      {
        participants: { $all: [currentUserId, otherUserId] },
        "unreadCounts.userId": currentUserId,
      },
      { $set: { "unreadCounts.$.count": 0 } }
    );

    // If there's no unread count entry for the current user yet, this is a no-op
    // but we'll handle that case in the frontend

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Send a message to a specific user
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const params = await context.params;
    const { content, isImage = false } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const senderId = new mongoose.Types.ObjectId(session.user.id);
    const receiverId = new mongoose.Types.ObjectId(params.userId);

    // Create the message
    let message = await Message.create({
      senderId,
      receiverId,
      content,
      isImage,
      read: false,
    });

    // Populate sender information for the response
    message = await Message.findById(message._id)
      .populate("senderId", "_id username profileImage")
      .lean();

    // Find or create a conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Create a new conversation with initial unread count for receiver only
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: content,
        lastMessageTime: new Date(),
        unreadCounts: [{ userId: receiverId, count: 1 }], // Only receiver has unread messages
      });
    } else {
      // Update the existing conversation
      // Increment unread count only for the receiver
      await Conversation.findOneAndUpdate(
        {
          _id: conversation._id,
          "unreadCounts.userId": receiverId,
        },
        {
          lastMessage: content,
          lastMessageTime: new Date(),
          $inc: { "unreadCounts.$.count": 1 }, // Increment receiver's unread count
        }
      );

      // If receiver doesn't have an unread count entry yet, add one
      const receiverHasUnreadEntry = conversation.unreadCounts?.some(
        (entry: { userId: mongoose.Types.ObjectId; count: number }) =>
          entry.userId.toString() === receiverId.toString()
      );

      if (!receiverHasUnreadEntry) {
        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: content,
          lastMessageTime: new Date(),
          $push: { unreadCounts: { userId: receiverId, count: 1 } },
        });
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
