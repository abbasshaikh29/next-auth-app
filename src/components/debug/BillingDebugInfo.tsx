"use client";

import { useCommunityBilling } from "@/contexts/CommunityBillingContext";

// Helper function to format dates and detect invalid dates
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // Check if it's an invalid date
  if (isNaN(date.getTime())) return 'Invalid Date';

  // Check if it's Unix epoch (1970-01-01) or close to it
  const epochTime = new Date('1970-01-01').getTime();
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

  if (date.getTime() <= (epochTime + oneYearInMs)) {
    return `Invalid (Unix Epoch: ${date.toISOString()})`;
  }

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export default function BillingDebugInfo() {
  const {
    billingData,
    loading,
    error,
    daysRemaining,
    trialActive,
    subscriptionActive,
    percentRemaining
  } = useCommunityBilling();

  if (loading) return <div className="text-sm text-gray-500">Loading debug info...</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs space-y-2">
      <h4 className="font-bold text-gray-700">Debug Info (Context)</h4>
      <div><strong>Payment Status:</strong> {billingData?.paymentStatus || 'N/A'}</div>
      <div><strong>Subscription Active:</strong> <span className={subscriptionActive ? 'text-green-600' : 'text-red-600'}>{subscriptionActive ? 'YES' : 'NO'}</span></div>
      <div><strong>Trial Active:</strong> <span className={trialActive ? 'text-yellow-600' : 'text-red-600'}>{trialActive ? 'YES' : 'NO'}</span></div>
      <div><strong>Days Remaining:</strong> {daysRemaining}</div>
      <div><strong>Subscription ID:</strong> {billingData?.subscriptionId || 'N/A'}</div>
      <div><strong>Subscription Status:</strong> {billingData?.subscriptionStatus || 'N/A'}</div>
      <div><strong>Community ID:</strong> {billingData?._id || 'N/A'}</div>
      <div><strong>Can Cancel:</strong> {subscriptionActive && billingData?._id ? 'YES' : 'NO'}</div>
      <div><strong>Cancel Method:</strong> {billingData?.subscriptionId ? 'Direct (with subscriptionId)' : 'Community-based (without subscriptionId)'}</div>
      <div><strong>Subscription End Date:</strong> <span className={billingData?.subscriptionEndDate && formatDate(billingData.subscriptionEndDate).includes('Invalid') ? 'text-red-600' : ''}>{formatDate(billingData?.subscriptionEndDate)}</span></div>
      <div><strong>Free Trial Activated:</strong> {billingData?.freeTrialActivated ? 'YES' : 'NO'}</div>
      <div><strong>Admin Trial Info:</strong>
        <div className="ml-4 mt-1 space-y-1">
          <div>Activated: {billingData?.adminTrialInfo?.activated ? 'YES' : 'NO'}</div>
          <div>Has Used Trial: {billingData?.adminTrialInfo?.hasUsedTrial ? 'YES' : 'NO'}</div>
          <div>Cancelled: <span className={billingData?.adminTrialInfo?.cancelled ? 'text-red-600' : 'text-green-600'}>{billingData?.adminTrialInfo?.cancelled ? 'YES' : 'NO'}</span></div>
          <div>Start Date: {formatDate(billingData?.adminTrialInfo?.startDate)}</div>
          <div>End Date: {formatDate(billingData?.adminTrialInfo?.endDate)}</div>
          <div>Cancelled Date: {formatDate(billingData?.adminTrialInfo?.cancelledDate)}</div>
        </div>
      </div>
    </div>
  );
}
