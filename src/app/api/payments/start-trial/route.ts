import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";

// POST /api/payments/start-trial - Start a 14-day free trial
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    // Find the user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active subscription or trial
    if (
      user.paymentSettings?.subscriptionStatus === "active" ||
      user.paymentSettings?.subscriptionStatus === "trial"
    ) {
      return NextResponse.json(
        { error: "User already has an active subscription or trial" },
        { status: 400 }
      );
    }

    // Initialize payment settings if they don't exist
    if (!user.paymentSettings) {
      user.paymentSettings = {};
    }

    // Set subscription status to trial
    user.paymentSettings.subscriptionStatus = "trial";

    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    user.paymentSettings.subscriptionEndDate = trialEndDate;

    // Set user role to admin during trial
    user.role = "admin";

    // Save the user
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Free trial started successfully",
      trialEndDate: trialEndDate,
      daysRemaining: 14,
    });
  } catch (error) {
    console.error("Error starting free trial:", error);
    return NextResponse.json(
      { error: "Failed to start free trial" },
      { status: 500 }
    );
  }
}
