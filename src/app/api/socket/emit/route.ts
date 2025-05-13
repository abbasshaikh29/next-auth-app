import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { emitToRoom, emitToAll, getIO } from "@/lib/socket";

export async function POST(request: NextRequest) {
  try {
    // Skip authentication check for socket events in development
    // This allows the socket events to work even if the session check fails
    let isAuthenticated = true;

    try {
      const session = await getServerSession();
      if (!session?.user?.id) {
        // In production, we would return 401 here
        // But for development, we'll allow it to continue
        console.warn("Unauthenticated socket event emission attempt");
        isAuthenticated = process.env.NODE_ENV === "development";
      }
    } catch (authError) {
      console.error("Auth error in socket emit:", authError);
      isAuthenticated = process.env.NODE_ENV === "development";
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the global Socket.io instance
    const io = getIO();
    if (!io) {
      console.error("Socket.io not initialized");
      return NextResponse.json(
        { error: "Socket.io not initialized" },
        { status: 500 }
      );
    }

    const { event, room, data } = await request.json();

    if (!event) {
      return NextResponse.json(
        { error: "Event name is required" },
        { status: 400 }
      );
    }

    console.log(`Emitting socket event: ${event} to room: ${room || "all"}`);

    let success = false;

    // If a room is specified, emit to that room
    if (room) {
      success = emitToRoom(room, event, data);
    } else {
      // Otherwise, emit to all connected clients
      success = emitToAll(event, data);
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to emit event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error emitting socket event:", error);
    return NextResponse.json(
      { error: "Failed to emit socket event" },
      { status: 500 }
    );
  }
}
