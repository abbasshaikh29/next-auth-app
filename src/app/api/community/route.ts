import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authoption } from "@/lib/authoptions";
import { dbconnect } from "@/lib/db";
import { Community, ICommunity } from "@/models/Community";

export async function GET() {
  try {
    await dbconnect();
    const Communitys = await Community.find({});

    if (!Communitys || Communitys.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(Communitys);
  } catch (error) {
    console.error("Error fetching community:", error);
    return NextResponse.json(
      { error: "Failed to fetch community" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authoption);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();
    const body: ICommunity = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new video with default values
    const videoData: ICommunity = {
      ...body,
      createdBy: session.user.id,
    };

    const newVideo = await Community.create(videoData);
    return NextResponse.json(newVideo);
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
