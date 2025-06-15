import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Test endpoint to verify signature generation
export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, paymentId, signature } = await request.json();
    
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeySecret) {
      return NextResponse.json({ 
        error: "Razorpay key secret not configured",
        configured: false
      });
    }

    // Generate signatures with both formats
    const format1 = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest("hex");

    const format2 = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${subscriptionId}|${paymentId}`)
      .digest("hex");

    return NextResponse.json({
      configured: true,
      input: {
        subscriptionId,
        paymentId,
        receivedSignature: signature
      },
      generated: {
        format1: `${paymentId}|${subscriptionId} -> ${format1}`,
        format2: `${subscriptionId}|${paymentId} -> ${format2}`
      },
      matches: {
        format1: format1 === signature,
        format2: format2 === signature
      },
      keySecretLength: razorpayKeySecret.length,
      keySecretPrefix: razorpayKeySecret.substring(0, 8) + "..."
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      configured: false
    }, { status: 500 });
  }
}
