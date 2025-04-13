import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Community, ICommunity } from "@/models/Community";
import slugify from "slugify";
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
    const session = await getServerSession();
    console.log("Session:", session);

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
    console.log(session);
    // Create new community with default values
    const communityData: ICommunity = {
      ...body,
      createdBy: session.user.username,
    };

    // Create document instance
    const newCommunity = new Community(communityData);

    // Explicitly generate slug if not set
    if (!newCommunity.slug && newCommunity.name) {
      newCommunity.slug = slugify(newCommunity.name, {
        lower: true,
        strict: true,
      });
    }

    await newCommunity.save();
    return NextResponse.json(newCommunity);
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
