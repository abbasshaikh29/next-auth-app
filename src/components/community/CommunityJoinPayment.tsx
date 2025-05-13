"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import PaymentPlansList from "@/components/payments/PaymentPlansList";

interface CommunityJoinPaymentProps {
  communityId: string;
  communitySlug: string;
  communityName: string;
}

const CommunityJoinPayment: React.FC<CommunityJoinPaymentProps> = ({
  communityId,
  communitySlug,
  communityName,
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Handle successful payment
  const handlePaymentSuccess = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccess("Payment successful! Joining community...");
    setTransactionId(data.transaction.id);

    try {
      // Call the join-paid API to complete the membership process
      const response = await fetch("/api/community/join-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId,
          transactionId: data.transaction.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join community");
      }

      setSuccess("Successfully joined community!");

      // Redirect to community page after a short delay
      setTimeout(() => {
        router.push(`/community/${communitySlug}`);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Error joining community:", error);
      setError(
        error instanceof Error ? error.message : "Failed to join community"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    setError(
      error instanceof Error
        ? error.message
        : "An error occurred during payment"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-halloween-purple mb-2">
          Join {communityName}
        </h2>
        <p className="text-halloween-black/70">
          This is a paid community. Choose a membership plan to join.
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <p>{success}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-halloween-orange" />
        </div>
      ) : (
        <PaymentPlansList
          planType="community"
          communityId={communityId}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default CommunityJoinPayment;
