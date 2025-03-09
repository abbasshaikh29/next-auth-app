import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";

export async function PUT(request: Request) {
  await dbconnect();
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, timezone } = await request.json();

  try {
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { firstName, lastName, timezone },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update account settings" },
      { status: 500 }
    );
  }
}
