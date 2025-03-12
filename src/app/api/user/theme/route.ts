import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authoption } from "@/lib/authoptions";
import { User } from "@/models/User";

export async function GET() {
  const session = await getServerSession(authoption);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ theme: user.theme || "" }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user theme:", error);
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authoption);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { theme } = await request.json();

    // Update user's theme preference in database
    await User.findByIdAndUpdate(session.user.id, { theme }, { new: true });

    return NextResponse.json(
      { message: "Theme updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    );
  }
}
