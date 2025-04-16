import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { dbconnect } from "@/lib/db";
// TEMPORARILY MODIFIED: Keeping only generateVerificationToken import
import { generateVerificationToken } from "@/lib/email";
// Will restore this when email verification is re-enabled: import { sendVerificationEmail } from "@/lib/email";

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
    // TEMPORARILY MODIFIED: Auto-verify all users
    await User.create({
      email,
      password,
      username,
      emailVerified: true, // TEMPORARILY set to true to bypass email verification
      verificationToken,
      verificationTokenExpiry,
    });

    // TEMPORARILY DISABLED: Email verification process
    // Skip sending verification email while keeping the code for future re-enabling
    console.log(
      "Email verification temporarily disabled - skipping email send for:",
      email
    );

    /* Original code - to be restored later:
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
    */

    return NextResponse.json(
      {
        message:
          "User registered successfully. You can now log in to your account.", // TEMPORARILY modified message
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
