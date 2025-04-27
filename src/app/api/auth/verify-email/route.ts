import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check if we're in the build phase
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.log("Build phase detected - skipping database operations");
      return NextResponse.json(
        { message: "Build phase - operation skipped" },
        { status: 200 }
      );
    }

    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    try {
      await dbconnect();
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Failed to connect to database" },
        { status: 503 }
      );
    }

    // Find user with the token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user as verified
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
