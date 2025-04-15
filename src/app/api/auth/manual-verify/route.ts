import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development mode
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "This endpoint is only available in development mode" },
        { status: 403 }
      );
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    await dbconnect();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Update user as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    return NextResponse.json(
      { message: "Email manually verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Manual email verification error:", error);
    return NextResponse.json(
      { error: "Failed to manually verify email" },
      { status: 500 }
    );
  }
}
