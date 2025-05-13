"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";

interface PaymentPlan {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  interval?: "one_time" | "monthly" | "yearly";
  intervalCount?: number;
  features?: string[];
  isActive: boolean;
}

interface CommunityPaymentSettingsProps {
  communityId: string;
  communitySlug: string;
}

const CommunityPaymentSettings: React.FC<CommunityPaymentSettingsProps> = ({
  communityId,
  communitySlug,
}) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);

  // Fetch community payment settings
  useEffect(() => {
    const fetchCommunitySettings = async () => {
      if (!session?.user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch community details
        const communityResponse = await fetch(
          `/api/community/${communitySlug}`
        );
        if (!communityResponse.ok) {
          throw new Error("Failed to fetch community details");
        }
        const communityData = await communityResponse.json();

        // Set payment settings
        setPaymentEnabled(communityData.paymentEnabled || false);
        setSubscriptionRequired(communityData.subscriptionRequired || false);

        // Fetch payment plans
        const plansResponse = await fetch(
          `/api/payments/plans?planType=community&communityId=${communityId}`
        );
        if (!plansResponse.ok) {
          throw new Error("Failed to fetch payment plans");
        }
        const plansData = await plansResponse.json();
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching community payment settings:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch payment settings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunitySettings();
  }, [session, communityId, communitySlug]);

  // Toggle payment settings
  const togglePaymentSettings = async (
    setting: "paymentEnabled" | "subscriptionRequired"
  ) => {
    setError(null);
    setSuccess(null);

    try {
      const newValue =
        setting === "paymentEnabled" ? !paymentEnabled : !subscriptionRequired;

      const response = await fetch(`/api/community/${communitySlug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [setting]: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment settings");
      }

      // Update local state
      if (setting === "paymentEnabled") {
        setPaymentEnabled(newValue);
      } else {
        setSubscriptionRequired(newValue);
      }

      setSuccess("Payment settings updated successfully");
    } catch (error) {
      console.error("Error updating payment settings:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update payment settings"
      );
    }
  };

  // Delete a payment plan
  const deletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this payment plan?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/payments/plans/${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete payment plan");
      }

      // Remove plan from local state
      setPlans(plans.filter((plan) => plan._id !== planId));
      setSuccess("Payment plan deleted successfully");
    } catch (error) {
      console.error("Error deleting payment plan:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete payment plan"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-halloween-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-base-100 rounded-box shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Payment Settings</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <p>{success}</p>
          </div>
        )}

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={paymentEnabled}
              onChange={() => togglePaymentSettings("paymentEnabled")}
            />
            <span className="label-text">
              Enable paid membership for this community
            </span>
          </label>
          <p className="text-sm text-halloween-black/60 ml-14">
            Require members to pay to join this community
          </p>
        </div>

        <div className="form-control mt-4">
          <label className="label cursor-pointer justify-start gap-4">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={subscriptionRequired}
              onChange={() => togglePaymentSettings("subscriptionRequired")}
              disabled={!paymentEnabled}
            />
            <span className="label-text">Require payment to join</span>
          </label>
          <p className="text-sm text-halloween-black/60 ml-14">
            Members must pay to join this community (no free join option)
          </p>
        </div>
      </div>

      <div className="bg-base-100 rounded-box shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Payment Plans</h3>
          <a
            href={`/community/${communitySlug}/payment-plans/new`}
            className="btn btn-sm bg-halloween-orange text-white hover:bg-halloween-orange/90 border-none"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Plan
          </a>
        </div>

        {plans.length === 0 ? (
          <div className="bg-base-200 rounded-lg p-6 text-center">
            <p className="text-halloween-black/70">
              No payment plans created yet. Create your first plan to start
              accepting payments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Interval</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan._id} className="hover">
                    <td>
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        {plan.description && (
                          <div className="text-xs text-halloween-black/60">
                            {plan.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: plan.currency,
                      }).format(plan.amount)}
                    </td>
                    <td>
                      {plan.interval === "one_time"
                        ? "One-time"
                        : plan.interval === "monthly"
                          ? "Monthly"
                          : "Yearly"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          plan.isActive ? "badge-success" : "badge-error"
                        } text-xs`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <a
                          href={`/community/${communitySlug}/payment-plans/${plan._id}/edit`}
                          className="btn btn-sm btn-ghost"
                          title="Edit plan"
                          aria-label="Edit payment plan"
                        >
                          <Edit className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => deletePlan(plan._id)}
                          className="btn btn-sm btn-ghost text-red-500"
                          title="Delete plan"
                          aria-label="Delete payment plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPaymentSettings;
