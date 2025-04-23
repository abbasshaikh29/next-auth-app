import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import mongoose from "mongoose";

// In-memory store for typing indicators
// This will be lost on server restart, but that's acceptable for typing indicators
const typingUsers = new Map<string, { userId: string; timestamp: number }[]>();

// Clean up typing indicators older than 10 seconds
const cleanupTypingIndicators = () => {
  const now = Date.now();
  for (const [conversationId, users] of typingUsers.entries()) {
    const activeUsers = users.filter(
      (user) => now - user.timestamp < 10000 // 10 seconds
    );
    if (activeUsers.length === 0) {
      typingUsers.delete(conversationId);
    } else {
      typingUsers.set(conversationId, activeUsers);
    }
  }
};

// Set typing indicator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { receiverId, isTyping } = await request.json();

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    const senderId = session.user.id;
    
    // Create a unique conversation ID (sorted user IDs joined with a dash)
    const userIds = [senderId, receiverId].sort();
    const conversationId = userIds.join("-");

    // Clean up old typing indicators
    cleanupTypingIndicators();

    // Update typing status
    if (isTyping) {
      // Add or update typing indicator
      let users = typingUsers.get(conversationId) || [];
      const existingIndex = users.findIndex((u) => u.userId === senderId);
      
      if (existingIndex >= 0) {
        users[existingIndex].timestamp = Date.now();
      } else {
        users.push({ userId: senderId, timestamp: Date.now() });
      }
      
      typingUsers.set(conversationId, users);
    } else {
      // Remove typing indicator
      const users = typingUsers.get(conversationId) || [];
      const updatedUsers = users.filter((u) => u.userId !== senderId);
      
      if (updatedUsers.length === 0) {
        typingUsers.delete(conversationId);
      } else {
        typingUsers.set(conversationId, updatedUsers);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating typing status:", error);
    return NextResponse.json(
      { error: "Failed to update typing status" },
      { status: 500 }
    );
  }
}

// Get typing indicators for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const receiverId = url.searchParams.get("receiverId");

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    const senderId = session.user.id;
    
    // Create a unique conversation ID (sorted user IDs joined with a dash)
    const userIds = [senderId, receiverId].sort();
    const conversationId = userIds.join("-");

    // Clean up old typing indicators
    cleanupTypingIndicators();

    // Get typing users for this conversation
    const users = typingUsers.get(conversationId) || [];
    
    // Filter out the current user
    const otherTypingUsers = users.filter((u) => u.userId !== senderId);

    return NextResponse.json({
      isTyping: otherTypingUsers.length > 0,
      users: otherTypingUsers,
    });
  } catch (error) {
    console.error("Error getting typing status:", error);
    return NextResponse.json(
      { error: "Failed to get typing status" },
      { status: 500 }
    );
  }
}
