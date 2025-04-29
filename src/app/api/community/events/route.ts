import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { Event, IEvent } from "@/models/Event";
import { Community } from "@/models/Community";

// Get all events for a community
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract community ID from the query parameters
    const communityId = request.nextUrl.searchParams.get("communityId");
    const startDate = request.nextUrl.searchParams.get("start");
    const endDate = request.nextUrl.searchParams.get("end");

    if (!communityId) {
      return NextResponse.json(
        { error: "Missing communityId" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find community first to verify it exists
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is a member of the community
    if (!community.members.includes(session.user.id)) {
      return NextResponse.json(
        { error: "You are not a member of this community" },
        { status: 403 }
      );
    }

    // Build query
    const query: any = { communityId };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.start = { $gte: new Date(startDate) };
      query.end = { $lte: new Date(endDate) };
    }

    // Fetch events
    const events = await Event.find(query).sort({ start: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventData = await request.json();
    const { communityId, title, start, end } = eventData;

    if (!communityId || !title || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbconnect();

    // Find community to check permissions
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or sub-admin
    const isAdmin = community.admin === session.user.id;
    const isSubAdmin = community.subAdmins?.includes(session.user.id) || false;

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Only admins and sub-admins can create events" },
        { status: 403 }
      );
    }

    // Create the event
    const newEvent = new Event({
      ...eventData,
      createdBy: session.user.id,
      createdAt: new Date(),
    });

    await newEvent.save();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
