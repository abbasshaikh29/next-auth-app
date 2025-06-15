"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useCommunityBilling } from "@/contexts/CommunityBillingContext";

interface SubscriptionDateFixerProps {
  slug?: string;
}

export default function SubscriptionDateFixer({ slug: propSlug }: SubscriptionDateFixerProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const { slug: contextSlug } = useCommunityBilling();
  const slug = propSlug || contextSlug || paramSlug;
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSubscriptionStatus = async () => {
    if (!slug) {
      setError('Community slug not available');
      return;
    }

    setChecking(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/fix-subscription-dates?slug=${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to check subscription status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setChecking(false);
    }
  };

  const fixSubscriptionDates = async () => {
    if (!slug) {
      setError('Community slug not available');
      return;
    }

    setFixing(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/fix-subscription-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        alert(data.message);
      } else {
        setError(data.error || 'Failed to fix subscription dates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="bg-yellow-100 p-4 rounded-lg text-xs space-y-4">
      <h4 className="font-bold text-yellow-700">Subscription Date Fixer</h4>
      
      <div>
        <strong>Community Slug:</strong> {slug || 'N/A'}
        {!slug && <span className="text-red-600 ml-2">(Required for API calls)</span>}
      </div>
      
      <div className="space-x-2">
        <button
          onClick={checkSubscriptionStatus}
          disabled={checking || !slug}
          className="btn btn-xs btn-info"
        >
          {checking ? 'Checking...' : 'Check Status'}
        </button>

        <button
          onClick={fixSubscriptionDates}
          disabled={fixing || !slug}
          className="btn btn-xs btn-warning"
        >
          {fixing ? 'Fixing...' : 'Fix Dates'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 p-2 rounded border border-red-300">
          <strong className="text-red-700">Error:</strong>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white p-2 rounded border">
          <strong>Result:</strong>
          <pre className="text-xs overflow-auto max-h-60 mt-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
