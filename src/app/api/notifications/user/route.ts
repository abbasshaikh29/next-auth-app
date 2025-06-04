import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Using auth() for App Router
import { dbconnect } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { Community } from "@/models/Community";
import mongoose from "mongoose";

// GET /api/notifications/user - Get notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const communityId = searchParams.get("communityId");

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(session.user.id) };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    if (communityId) {
      query.communityId = new mongoose.Types.ObjectId(communityId);
    }

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "username profileImage")
      .populate("communityId", "name slug iconImageUrl")
      .lean();

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/user - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const { notificationIds, all = false } = await request.json();

    if (!all && (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0)) {
      return NextResponse.json(
        { error: "Notification IDs are required" },
        { status: 400 }
      );
    }

    let updateResult;

    if (all) {
      // Mark all notifications as read for the user
      updateResult = await Notification.updateMany(
        { userId: new mongoose.Types.ObjectId(session.user.id), read: false },
        { $set: { read: true } }
      );
    } else {
      // Mark specific notifications as read
      updateResult = await Notification.updateMany(
        {
          _id: { $in: notificationIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
          userId: new mongoose.Types.ObjectId(session.user.id),
        },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
