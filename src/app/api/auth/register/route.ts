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
      const emailResult = await sendVerificationEmail(
        email,
        verificationToken,
        username
      );
      console.log("Email verification result:", emailResult);

      // In development, automatically verify the email if configured
      if (
        process.env.NODE_ENV === "development" &&
        process.env.AUTO_VERIFY_EMAIL === "true"
      ) {
        console.log("Auto-verifying email in development mode");
        const user = await User.findOne({ email });
        if (user) {
          user.emailVerified = true;
          await user.save();
          console.log("Email auto-verified for:", email);
        }
      }
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
