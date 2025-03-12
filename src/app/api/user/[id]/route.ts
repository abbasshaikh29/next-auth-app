import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbconnect();

  try {
    const user = await User.findById(params.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
