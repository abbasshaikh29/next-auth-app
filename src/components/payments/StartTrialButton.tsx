"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface StartTrialButtonProps {
  buttonText?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

const StartTrialButton: React.FC<StartTrialButtonProps> = ({
  buttonText = "Start 14-Day Free Trial",
  onSuccess,
  onError,
  className = "btn bg-halloween-orange text-white hover:bg-halloween-orange/90 border-none",
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the API to start the free trial
      const response = await fetch("/api/payments/start-trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start free trial");
      }

      const data = await response.json();

      // Call success callback if provided
      if (onSuccess) onSuccess(data);

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error starting free trial:", error);
      setError(
        error instanceof Error ? error.message : "Failed to start free trial"
      );
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleStartTrial}
        disabled={isLoading}
        className={className}
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

export default StartTrialButton;
