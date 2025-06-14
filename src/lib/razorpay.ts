import crypto from "crypto";
import loadEnv from "@/lib/env-loader";

// Load environment variables
loadEnv();

// Razorpay API keys
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

// Validate configuration at startup
export function checkRazorpayConfig() {
  if (!razorpayKeyId || !razorpayKeySecret) {
    const errorMessage = "Razorpay configuration error: Missing API credentials. " +
      "Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  console.log("Razorpay configuration validated successfully");
}

/**
 * Create a new Razorpay order using fetch API
 * @param amount Amount in smallest currency unit (paise for INR)
 * @param currency Currency code (default: INR)
 * @param receipt Optional receipt ID
 * @param notes Optional notes for the order
 * @returns Razorpay order object
 */
export const createOrder = async (
  amount: number,
  currency: string = "INR",
  receipt?: string,
  notes?: Record<string, string>
) => {
  // Validate configuration on first use
  if (!razorpayKeyId || !razorpayKeySecret) {
    const errorMessage = "Razorpay configuration error: Missing API credentials. " +
      "Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.";
    console.error(errorMessage);
    console.error("Current RAZORPAY_KEY_ID:", razorpayKeyId ? "***" : "not set");
    console.error("Current RAZORPAY_KEY_SECRET:", razorpayKeySecret ? "***" : "not set");
    throw new Error(errorMessage);
  }

  // Check for dummy/placeholder credentials
  if (razorpayKeySecret === "thiIsADummyKeySecret123" ||
      razorpayKeySecret.includes("dummy") ||
      razorpayKeySecret.includes("placeholder")) {
    const errorMessage = "Razorpay configuration error: You are using dummy/placeholder credentials. " +
      "Please replace with your actual Razorpay API credentials from dashboard.razorpay.com";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    // Create Basic Auth credentials
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

    // Prepare request body
    const requestBody = {
      amount: amount * 100, // Convert to paise (smallest currency unit)
      currency,
      receipt,
      notes,
    };

    // Make API request to Razorpay
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Razorpay API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
        keyId: razorpayKeyId,
        keySecretLength: razorpayKeySecret?.length
      });

      // Provide specific error messages for common issues
      let errorMessage = `Razorpay API error: ${errorData.error?.description || "Unknown error"}`;

      if (response.status === 401) {
        errorMessage += "\n\nThis is an authentication error. Please check:\n" +
          "1. Your RAZORPAY_KEY_ID is correct\n" +
          "2. Your RAZORPAY_KEY_SECRET is correct\n" +
          "3. You're not using dummy/placeholder credentials\n" +
          "4. Your credentials are from the correct environment (test/live)";
      }

      throw new Error(errorMessage);
    }

    const order = await response.json();
    return order;
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param orderId Razorpay order ID
 * @param paymentId Razorpay payment ID
 * @param signature Razorpay signature
 * @returns Boolean indicating if signature is valid
 */
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  if (!razorpayKeySecret) {
    throw new Error("Razorpay is not configured");
  }

  try {
    // Generate the expected signature
    const generatedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Compare the generated signature with the received signature
    return generatedSignature === signature;
  } catch (error) {
    console.error("Error verifying Razorpay signature:", error);
    throw error;
  }
};

/**
 * Fetch payment details from Razorpay
 * @param paymentId Razorpay payment ID
 * @returns Payment details
 */
export const fetchPaymentDetails = async (paymentId: string) => {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay is not configured");
  }

  try {
    // Create Basic Auth credentials
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString(
      "base64"
    );

    // Make API request to Razorpay
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Razorpay API error: ${errorData.error?.description || "Unknown error"}`
      );
    }

    const payment = await response.json();
    return payment;
  } catch (error) {
    console.error("Error fetching Razorpay payment:", error);
    throw error;
  }
};

/**
 * Capture a payment (convert authorized payment to captured)
 * @param paymentId Razorpay payment ID
 * @param amount Amount to capture (in paise)
 * @returns Captured payment details
 */
export const capturePayment = async (paymentId: string, amount: number) => {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error("Razorpay is not configured");
  }

  try {
    // Create Basic Auth credentials
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString(
      "base64"
    );

    // Make API request to Razorpay
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amount * 100 }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Razorpay API error: ${errorData.error?.description || "Unknown error"}`
      );
    }

    const payment = await response.json();
    return payment;
  } catch (error) {
    console.error("Error capturing Razorpay payment:", error);
    throw error;
  }
};
