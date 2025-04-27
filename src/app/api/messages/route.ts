import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";
import mongoose from "mongoose";

// Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "participants",
        select: "_id username profileImage",
        match: { _id: { $ne: userId } }, // Exclude the current user
      })
      .lean(); // Convert to plain JavaScript object

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// Create a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { receiverId, content, isImage = false } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Receiver ID and content are required" },
        { status: 400 }
      );
    }

    const senderId = new mongoose.Types.ObjectId(session.user.id);
    const receiverObjId = new mongoose.Types.ObjectId(receiverId);

    // Create the message
    let message = await Message.create({
      senderId,
      receiverId: receiverObjId,
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
      participants: { $all: [senderId, receiverObjId] },
    });

    if (!conversation) {
      // Create a new conversation with initial unread count for receiver only
      conversation = await Conversation.create({
        participants: [senderId, receiverObjId],
        lastMessage: content,
        lastMessageTime: new Date(),
        unreadCounts: [{ userId: receiverObjId, count: 1 }], // Only receiver has unread messages
      });
    } else {
      // Update the existing conversation
      // Increment unread count only for the receiver
      await Conversation.findOneAndUpdate(
        {
          _id: conversation._id,
          "unreadCounts.userId": receiverObjId,
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
          entry.userId.toString() === receiverObjId.toString()
      );

      if (!receiverHasUnreadEntry) {
        await Conversation.findByIdAndUpdate(conversation._id, {
          lastMessage: content,
          lastMessageTime: new Date(),
          $push: { unreadCounts: { userId: receiverObjId, count: 1 } },
        });
      }
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
