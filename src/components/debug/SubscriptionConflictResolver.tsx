"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react";

interface SubscriptionConflictResolverProps {
  slug?: string;
}

interface ConflictingSubscription {
  _id: string;
  razorpaySubscriptionId: string;
  status: string;
  currentStart: string;
  currentEnd: string;
  adminId: string;
  communityId: string;
  createdAt: string;
}

interface ConflictAnalysis {
  hasConflicts: boolean;
  conflictingSubscriptions: ConflictingSubscription[];
  communityData: {
    paymentStatus: string;
    subscriptionId: string;
    subscriptionEndDate: string;
    adminTrialInfo: any;
  };
  recommendations: string[];
}

export default function SubscriptionConflictResolver({ slug: propSlug }: SubscriptionConflictResolverProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  
  const [analyzing, setAnalyzing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [analysis, setAnalysis] = useState<ConflictAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const analyzeConflicts = async () => {
    if (!slug) {
      setError('Community slug not available');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`/api/admin/analyze-subscription-conflicts?slug=${slug}`);
      const data = await response.json();
      
      if (response.ok) {
        setAnalysis(data);
      } else {
        setError(data.error || 'Failed to analyze subscription conflicts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  };

  const resolveConflicts = async (action: 'cleanup' | 'force-reset') => {
    if (!slug) {
      setError('Community slug not available');
      return;
    }

    setResolving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/admin/resolve-subscription-conflicts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, action }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        setAnalysis(null); // Clear analysis to force re-analysis
      } else {
        setError(data.error || 'Failed to resolve subscription conflicts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md border border-warning">
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2 text-warning">
          <AlertTriangle className="w-5 h-5" />
          Subscription Conflict Resolver
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          This tool helps resolve "Community already has an active subscription" errors by identifying and cleaning up conflicting subscription records.
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <XCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={analyzeConflicts}
            disabled={analyzing}
            className="btn btn-primary btn-sm"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Analyze Conflicts
              </>
            )}
          </button>
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="divider">Analysis Results</div>
            
            <div className={`alert ${analysis.hasConflicts ? 'alert-warning' : 'alert-success'}`}>
              {analysis.hasConflicts ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Found {analysis.conflictingSubscriptions.length} conflicting subscription(s)</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>No subscription conflicts detected</span>
                </>
              )}
            </div>

            {analysis.hasConflicts && (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full text-xs">
                    <thead>
                      <tr>
                        <th>Subscription ID</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.conflictingSubscriptions.map((sub) => (
                        <tr key={sub._id}>
                          <td className="font-mono text-xs">{sub.razorpaySubscriptionId.substring(0, 20)}...</td>
                          <td>
                            <span className={`badge badge-sm ${
                              sub.status === 'active' ? 'badge-success' :
                              sub.status === 'trial' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td>{new Date(sub.currentStart).toLocaleDateString()}</td>
                          <td>{new Date(sub.currentEnd).toLocaleDateString()}</td>
                          <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-base-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => resolveConflicts('cleanup')}
                    disabled={resolving}
                    className="btn btn-warning btn-sm"
                  >
                    {resolving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resolving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Smart Cleanup
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => resolveConflicts('force-reset')}
                    disabled={resolving}
                    className="btn btn-error btn-sm"
                  >
                    {resolving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Force Reset
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  <strong>Smart Cleanup:</strong> Removes expired/invalid subscriptions while preserving valid ones.<br/>
                  <strong>Force Reset:</strong> Removes all conflicting subscriptions (use with caution).
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
