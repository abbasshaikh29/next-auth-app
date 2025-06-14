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

    // Debug: Check if the public key is available
    console.log("NEXT_PUBLIC_RAZORPAY_KEY_ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setError("Razorpay configuration error: Public key not found");
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

      // Check if Razorpay script is loaded (should be loaded globally now)
      console.log("Checking if Razorpay script is loaded...");
      if (!window.Razorpay) {
        console.log("Razorpay script not found, waiting for it to load...");
        // Wait a bit for the script to load since it's loaded asynchronously
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!window.Razorpay) {
          throw new Error("Razorpay script failed to load. Please check your internet connection.");
        }
      }
      console.log("Razorpay script is available");

      // Create Razorpay options with minimal configuration for testing
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_B0Q2ICQRRrWMQr",
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        name: "TheTribeLab",
        description: paymentType === "platform" ? "Platform Subscription" : "Community Membership",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log("Payment successful:", response);
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
          color: "#F37021",
        },
        modal: {
          ondismiss: function() {
            console.log("Modal dismissed by user");
          }
        }
      };

      // Open Razorpay checkout
      console.log("Creating Razorpay instance with options:", options);
      const razorpay = new window.Razorpay(options);
      console.log("Razorpay instance created, opening checkout...");

      // Try to open the checkout
      try {
        razorpay.open();
        console.log("Razorpay checkout opened successfully");
      } catch (error) {
        console.error("Error opening Razorpay checkout:", error);
        throw error;
      }

      // Check if modal actually opened after a short delay
      setTimeout(() => {
        const razorpayModal = document.querySelector('.razorpay-container') as HTMLElement;
        const razorpayIframe = document.querySelector('iframe.razorpay-checkout-frame') as HTMLElement;

        if (razorpayModal) {
          console.log("Razorpay modal found in DOM:", razorpayModal);
          console.log("Modal visibility:", razorpayModal.style.visibility);
          console.log("Modal display:", razorpayModal.style.display);

          if (razorpayIframe) {
            console.log("Razorpay iframe found:", razorpayIframe);
            console.log("Iframe visibility:", razorpayIframe.style.visibility);
            console.log("Iframe display:", razorpayIframe.style.display);

            // Force the modal and iframe to be visible
            if (razorpayModal.style.visibility === 'hidden') {
              console.log("Forcing modal to be visible...");
              razorpayModal.style.visibility = 'visible';
              razorpayModal.style.opacity = '1';
              razorpayModal.style.zIndex = '999999';
            }

            if (razorpayIframe.style.visibility === 'hidden' || razorpayIframe.style.display === 'none') {
              console.log("Forcing iframe to be visible...");
              razorpayIframe.style.visibility = 'visible';
              razorpayIframe.style.display = 'block';
              razorpayIframe.style.opacity = '1';
            }

            // Check iframe dimensions and positioning
            const iframeRect = razorpayIframe.getBoundingClientRect();
            console.log("Iframe dimensions:", {
              width: iframeRect.width,
              height: iframeRect.height,
              top: iframeRect.top,
              left: iframeRect.left,
              visible: iframeRect.width > 0 && iframeRect.height > 0
            });

            // Check if iframe has loaded
            const iframe = razorpayIframe as HTMLIFrameElement;
            console.log("Iframe src:", iframe.src);
            console.log("Iframe loaded:", iframe.src ? "Yes" : "No");

            // Try to ensure iframe is properly sized and positioned
            if (iframeRect.width === 0 || iframeRect.height === 0) {
              console.log("Iframe has no dimensions, fixing...");
              razorpayIframe.style.width = '100%';
              razorpayIframe.style.height = '100%';
              razorpayIframe.style.minWidth = '400px';
              razorpayIframe.style.minHeight = '500px';
            }
          }
        } else {
          console.log("Razorpay modal NOT found in DOM");
        }
      }, 500);

      // Handle Razorpay events
      razorpay.on("payment.failed", function (response: any) {
        console.log("Payment failed:", response);
        setError(`Payment failed: ${response.error.description}`);
        if (onError) onError(response.error);
      });

      // Add modal dismiss handler
      razorpay.on("payment.cancel", function () {
        console.log("Payment cancelled by user");
        setError("Payment was cancelled");
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
    return new Promise((resolve, reject) => {
      console.log("Loading Razorpay script from:", "https://checkout.razorpay.com/v1/checkout.js");
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = (error) => {
        console.error("Failed to load Razorpay script:", error);
        reject(new Error("Failed to load Razorpay script"));
      };
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
      } else if (paymentType === "community" && verifyData.community?.slug) {
        // Redirect to community page using slug
        router.push(`/Newcompage/${verifyData.community.slug}`);
        router.refresh();
      } else if (paymentType === "community" && communityId) {
        // Fallback: redirect using ID if slug is not available (this shouldn't happen but kept for safety)
        router.push(`/Newcompage/${communityId}`);
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
        className="btn bg-primary text-white hover:bg-primary/90 border-none"
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
