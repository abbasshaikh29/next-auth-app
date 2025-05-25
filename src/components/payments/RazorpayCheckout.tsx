"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface RazorpayCheckoutProps {
  amount: number;
  currency?: string;
  planId?: string;
  paymentType: "platform" | "community";
  communityId?: string;
  buttonText?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  currency = "INR",
  planId,
  paymentType,
  communityId,
  buttonText = "Pay Now",
  onSuccess,
  onError,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!session?.user) {
      setError("You must be logged in to make a payment");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create order on the server
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency,
          planId,
          paymentType,
          communityId,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Create Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        name: "TheTribeLab",
        description:
          paymentType === "platform"
            ? "Platform Subscription"
            : "Community Membership",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify payment on the server
          await verifyPayment(
            orderData.orderId,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        prefill: {
          name: session.user.name || "",
          email: session.user.email || "",
        },
        theme: {
          color: "#F37021", // Halloween orange
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle Razorpay events
      razorpay.on("payment.failed", function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
        if (onError) onError(response.error);
      });
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during payment"
      );
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  // Verify payment on the server
  const verifyPayment = async (
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    try {
      // Use the appropriate verification endpoint based on payment type
      const endpoint = paymentType === "community" 
        ? "/api/payments/community/verify-payment" 
        : "/api/payments/verify";
      
      const verifyResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature,
          communityId: paymentType === "community" ? communityId : undefined,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || "Payment verification failed");
      }

      const verifyData = await verifyResponse.json();

      // Call success callback
      if (onSuccess) onSuccess(verifyData);

      // Refresh the page or redirect based on payment type
      if (paymentType === "platform") {
        // Redirect to dashboard or admin page
        router.push("/dashboard");
        router.refresh();
      } else if (paymentType === "community" && communityId) {
        // Redirect to community page
        router.push(`/community/${communityId}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error instanceof Error ? error.message : "Payment verification failed"
      );
      if (onError) onError(error);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading}
        className="btn bg-halloween-orange text-white hover:bg-halloween-orange/90 border-none"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          buttonText
        )}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default RazorpayCheckout;
