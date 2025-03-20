import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  await dbconnect();
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = newPassword;
    const savedUser = await user.save();
    console.log("Updated user password hash:", savedUser.password);

    // Invalidate current session
    const { authOptions } = await import("@/lib/authoptions");
    const { getToken } = await import("next-auth/jwt");
    const { NextRequest } = await import("next/server");

    const token = await getToken({
      req: request as unknown as Parameters<typeof getToken>[0]["req"],
    });

    if (token && authOptions.callbacks?.jwt) {
      await authOptions.callbacks.jwt({
        token,
        user: {
          id: "",
          email: "",
          username: "",
          name: "",
          image: null,
        },
        account: null,
        profile: undefined,
        isNewUser: false,
      });
    }

    return NextResponse.json({
      message: "Password updated successfully",
      requireReauth: true,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

// $2a$10$DhZSQzebZBbq6C78bH8Qdel37ekjtRE4jSO3fowbxuZGZvjv3Yany
//"$2a$10$q1GNm4fcoA4eDBmgUvk/Ie5rf7nfo2DjfhXUxrfD1J9OHWarIFQ9u"
