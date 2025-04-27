import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the messaging preferences
    return NextResponse.json({
      messagingPreferences: user.messagingPreferences || {
        allowDirectMessages: true,
        blockedCommunities: [],
      },
    });
  } catch (error) {
    console.error("Error fetching messaging preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch messaging preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowDirectMessages, blockedCommunities } = await request.json();

    await dbconnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update messaging preferences
    user.messagingPreferences = {
      allowDirectMessages: allowDirectMessages !== undefined ? allowDirectMessages : true,
      blockedCommunities: blockedCommunities || [],
    };

    await user.save();

    return NextResponse.json({
      success: true,
      messagingPreferences: user.messagingPreferences,
    });
  } catch (error) {
    console.error("Error updating messaging preferences:", error);
    return NextResponse.json(
      { error: "Failed to update messaging preferences" },
      { status: 500 }
    );
  }
}

// Endpoint to toggle messaging for a specific community
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { communityId, allowMessages } = await request.json();
    
    if (!communityId) {
      return NextResponse.json(
        { error: "Community ID is required" },
        { status: 400 }
      );
    }

    await dbconnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize messaging preferences if they don't exist
    if (!user.messagingPreferences) {
      user.messagingPreferences = {
        allowDirectMessages: true,
        blockedCommunities: [],
      };
    }

    // Initialize blockedCommunities array if it doesn't exist
    if (!user.messagingPreferences.blockedCommunities) {
      user.messagingPreferences.blockedCommunities = [];
    }

    // Update the blocked communities list based on the allowMessages flag
    if (allowMessages) {
      // Remove the community from blocked list
      user.messagingPreferences.blockedCommunities = user.messagingPreferences.blockedCommunities.filter(
        (id: string) => id !== communityId
      );
    } else {
      // Add the community to blocked list if not already there
      if (!user.messagingPreferences.blockedCommunities.includes(communityId)) {
        user.messagingPreferences.blockedCommunities.push(communityId);
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      messagingPreferences: user.messagingPreferences,
    });
  } catch (error) {
    console.error("Error updating community messaging preference:", error);
    return NextResponse.json(
      { error: "Failed to update community messaging preference" },
      { status: 500 }
    );
  }
}
