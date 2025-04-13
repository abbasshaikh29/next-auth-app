import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";

interface UserType {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  image?: string;
  // Add other fields as needed
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await dbconnect();
    const user: UserType | null = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
