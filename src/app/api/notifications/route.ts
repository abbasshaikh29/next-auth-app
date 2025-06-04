import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Using auth() for App Router
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";
import { Notification } from "@/models/Notification";
import mongoose from "mongoose";

export async function PUT(request: Request) {
  await dbconnect();
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { emailNotifications, pushNotifications, smsNotifications } =
    await request.json();

  try {
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        notificationSettings: {
          email: emailNotifications,
          push: pushNotifications,
          sms: smsNotifications,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  await dbconnect();
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = searchParams.get("limit");

    let queryFilter: any = {
      userId: new mongoose.Types.ObjectId(session.user.id),
    };

    if (unreadOnly) {
      queryFilter.read = false;
    }

    let queryChain = Notification.find(queryFilter)
      .populate({
        path: "createdBy",
        select: "username profileImage",
        model: User,
      })
      .sort({ createdAt: -1 });

    if (limit && !isNaN(parseInt(limit))) {
      queryChain = queryChain.limit(parseInt(limit));
    }

    const notifications = await queryChain.exec();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
