import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { dbconnect } from "@/lib/db";
import { User } from "@/models/User";
import { checkTrialEligibility, activateTrial } from "@/lib/trial-service";

// POST /api/payments/start-trial - Start a 14-day free trial (User-level trial)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbconnect();

    // Get client IP and user agent for fraud detection
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check trial eligibility using the secure trial service
    const eligibility = await checkTrialEligibility(session.user.id, "user");

    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: eligibility.reason },
        { status: 400 }
      );
    }

    // Activate trial using the secure trial service
    const result = await activateTrial(
      session.user.id,
      "user",
      undefined, // No community ID for user trials
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    console.log('User trial activated successfully:', {
      userId: session.user.id,
      trialEndDate: result.trialEndDate
    });

    return NextResponse.json({
      success: true,
      message: "Free trial started successfully. This is your one-time trial - make the most of it!",
      trialEndDate: result.trialEndDate,
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
