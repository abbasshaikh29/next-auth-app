import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    await dbconnect();
    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return NextResponse.json(
        { error: "User already registered" },
        {
          status: 400,
        }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // Token expires in 24 hours

    // Create user with verification token
    await User.create({
      email,
      password,
      username,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, username);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    return NextResponse.json(
      {
        message:
          "User registered successfully. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Failed to register",
      },
      { status: 500 }
    );
  }
}
