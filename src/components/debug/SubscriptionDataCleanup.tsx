"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

interface DetailedStatus {
  found: boolean;
  error?: string;
  community?: {
    id: string;
    name: string;
    slug: string;
    paymentStatus: string;
    subscriptionId: string | null;
    subscriptionEndDate: string | null;
    adminTrialInfo: any;
    freeTrialActivated: boolean;
  };
  subscriptionRecord?: {
    id: string;
    status: string;
    currentStart: string;
    currentEnd: string;
    amount: number;
    currency: string;
  } | null;
  allSubscriptions?: Array<{
    id: string;
    status: string;
    currentStart: string;
    currentEnd: string;
    createdAt: string;
  }>;
  validation?: {
    hasValidSubscriptionEndDate: boolean;
    hasValidTrialEndDate: boolean;
    subscriptionEndDateValue: string | null;
    trialEndDateValue: string | null;
    isSubscriptionExpired: boolean | null;
    isTrialExpired: boolean | null;
    trialCancelled: boolean;
    trialActivated: boolean;
  };
}

interface CleanupResult {
  success: boolean;
  message?: string;
  error?: string;
  issues?: string[];
  fixes?: string[];
  updated?: boolean;
  community?: any;
}

export default function SubscriptionDataCleanup() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [detailedStatus, setDetailedStatus] = useState<DetailedStatus | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDetailedStatus = async () => {
    if (!slug) {
      setError('Community slug not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cleanup-subscription-data?slug=${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setDetailedStatus(data);
      } else {
        setError(data.error || 'Failed to get detailed status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const cleanupData = async () => {
    if (!slug) {
      setError('Community slug not available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/cleanup-subscription-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();
      if (response.ok) {
        setCleanupResult(data);
        // Refresh detailed status after cleanup
        await getDetailedStatus();
      } else {
        setError(data.error || 'Failed to cleanup data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const epochTime = new Date('1970-01-01').getTime();
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    
    if (date.getTime() <= (epochTime + oneYearInMs)) {
      return `Invalid (Unix Epoch: ${date.toISOString()})`;
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Subscription Data Cleanup & Debug</h3>
      
      <div className="flex gap-4">
        <button
          onClick={getDetailedStatus}
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          {loading ? 'Loading...' : 'Get Detailed Status'}
        </button>
        
        <button
          onClick={cleanupData}
          disabled={loading}
          className="btn btn-warning btn-sm"
        >
          {loading ? 'Cleaning...' : 'Cleanup Data'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {cleanupResult && (
        <div className={`alert ${cleanupResult.success ? 'alert-success' : 'alert-error'}`}>
          <div>
            <h4 className="font-bold">Cleanup Result</h4>
            <p>{cleanupResult.message || cleanupResult.error}</p>
            {cleanupResult.issues && cleanupResult.issues.length > 0 && (
              <div className="mt-2">
                <strong>Issues Found:</strong>
                <ul className="list-disc list-inside ml-4">
                  {cleanupResult.issues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            {cleanupResult.fixes && cleanupResult.fixes.length > 0 && (
              <div className="mt-2">
                <strong>Fixes Applied:</strong>
                <ul className="list-disc list-inside ml-4">
                  {cleanupResult.fixes.map((fix, index) => (
                    <li key={index} className="text-sm text-green-700">{fix}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {detailedStatus && detailedStatus.found && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold text-gray-700 mb-3">Community Data</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>ID:</strong> {detailedStatus.community?.id}</div>
              <div><strong>Name:</strong> {detailedStatus.community?.name}</div>
              <div><strong>Slug:</strong> {detailedStatus.community?.slug}</div>
              <div><strong>Payment Status:</strong> <span className={`font-semibold ${detailedStatus.community?.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{detailedStatus.community?.paymentStatus}</span></div>
              <div><strong>Subscription ID:</strong> {detailedStatus.community?.subscriptionId || 'N/A'}</div>
              <div><strong>Free Trial Activated:</strong> {detailedStatus.community?.freeTrialActivated ? 'YES' : 'NO'}</div>
            </div>
          </div>

          {detailedStatus.validation && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-700 mb-3">Validation Results</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Subscription End Date Valid:</strong> <span className={detailedStatus.validation.hasValidSubscriptionEndDate ? 'text-green-600' : 'text-red-600'}>{detailedStatus.validation.hasValidSubscriptionEndDate ? 'YES' : 'NO'}</span></div>
                <div><strong>Subscription End Date:</strong> <span className={!detailedStatus.validation.hasValidSubscriptionEndDate ? 'text-red-600' : ''}>{formatDate(detailedStatus.validation.subscriptionEndDateValue)}</span></div>
                <div><strong>Trial End Date Valid:</strong> <span className={detailedStatus.validation.hasValidTrialEndDate ? 'text-green-600' : 'text-red-600'}>{detailedStatus.validation.hasValidTrialEndDate ? 'YES' : 'NO'}</span></div>
                <div><strong>Trial End Date:</strong> <span className={!detailedStatus.validation.hasValidTrialEndDate ? 'text-red-600' : ''}>{formatDate(detailedStatus.validation.trialEndDateValue)}</span></div>
                <div><strong>Trial Activated:</strong> <span className={detailedStatus.validation.trialActivated ? 'text-green-600' : 'text-red-600'}>{detailedStatus.validation.trialActivated ? 'YES' : 'NO'}</span></div>
                <div><strong>Trial Cancelled:</strong> <span className={detailedStatus.validation.trialCancelled ? 'text-red-600' : 'text-green-600'}>{detailedStatus.validation.trialCancelled ? 'YES' : 'NO'}</span></div>
                <div><strong>Subscription Expired:</strong> {detailedStatus.validation.isSubscriptionExpired !== null ? (detailedStatus.validation.isSubscriptionExpired ? 'YES' : 'NO') : 'N/A'}</div>
                <div><strong>Trial Expired:</strong> {detailedStatus.validation.isTrialExpired !== null ? (detailedStatus.validation.isTrialExpired ? 'YES' : 'NO') : 'N/A'}</div>
              </div>
            </div>
          )}

          {detailedStatus.subscriptionRecord && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-700 mb-3">Active Subscription Record</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>ID:</strong> {detailedStatus.subscriptionRecord.id}</div>
                <div><strong>Status:</strong> <span className="font-semibold">{detailedStatus.subscriptionRecord.status}</span></div>
                <div><strong>Current Start:</strong> {formatDate(detailedStatus.subscriptionRecord.currentStart)}</div>
                <div><strong>Current End:</strong> {formatDate(detailedStatus.subscriptionRecord.currentEnd)}</div>
                <div><strong>Amount:</strong> ₹{(detailedStatus.subscriptionRecord.amount / 100).toFixed(2)}</div>
                <div><strong>Currency:</strong> {detailedStatus.subscriptionRecord.currency}</div>
              </div>
            </div>
          )}

          {detailedStatus.allSubscriptions && detailedStatus.allSubscriptions.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-bold text-yellow-700 mb-3">All Subscription Records ({detailedStatus.allSubscriptions.length})</h4>
              <div className="space-y-2">
                {detailedStatus.allSubscriptions.map((sub, index) => (
                  <div key={index} className="text-sm border-l-4 border-yellow-400 pl-3">
                    <div><strong>ID:</strong> {sub.id}</div>
                    <div><strong>Status:</strong> {sub.status}</div>
                    <div><strong>Period:</strong> {formatDate(sub.currentStart)} - {formatDate(sub.currentEnd)}</div>
                    <div><strong>Created:</strong> {formatDate(sub.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
