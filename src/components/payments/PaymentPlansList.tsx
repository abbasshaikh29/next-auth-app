"use client";

import React, { useState, useEffect } from "react";
import PaymentPlanCard from "./PaymentPlanCard";
import { Loader2 } from "lucide-react";

interface PaymentPlansListProps {
  planType: "platform" | "community";
  communityId?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface PaymentPlan {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval?: "one_time" | "monthly" | "yearly";
  intervalCount?: number;
  features?: string[];
  planType: "platform" | "community";
  communityId?: string;
  isActive: boolean;
}

const PaymentPlansList: React.FC<PaymentPlansListProps> = ({
  planType,
  communityId,
  onSuccess,
  onError,
}) => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append("planType", planType);
        params.append("activeOnly", "true");
        
        if (communityId) {
          params.append("communityId", communityId);
        }

        // Fetch plans
        const response = await fetch(`/api/payments/plans?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch payment plans");
        }

        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching payment plans:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch payment plans"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [planType, communityId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-halloween-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <p>No payment plans available at this time.</p>
      </div>
    );
  }

  // Find the middle plan to mark as popular (if there are 3 or more plans)
  const getPopularPlanIndex = () => {
    if (plans.length >= 3) {
      return Math.floor(plans.length / 2);
    }
    return -1; // No popular plan for less than 3 plans
  };

  const popularIndex = getPopularPlanIndex();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {plans.map((plan, index) => (
        <PaymentPlanCard
          key={plan._id}
          plan={plan}
          isPopular={index === popularIndex}
          onSuccess={onSuccess}
          onError={onError}
        />
      ))}
    </div>
  );
};

export default PaymentPlansList;
