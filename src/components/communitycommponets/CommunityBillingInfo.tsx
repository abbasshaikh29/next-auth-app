"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

interface CommunityBillingInfo {
  _id: string;
  adminTrialInfo?: {
    activated: boolean;
    startDate?: string;
    endDate?: string;
  };
  paymentStatus?: "unpaid" | "trial" | "paid" | "expired";
  subscriptionEndDate?: string;
  freeTrialActivated?: boolean;
}

export default function CommunityBillingInfo() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingInfo, setBillingInfo] = useState<CommunityBillingInfo | null>(null);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [cancellingTrial, setCancellingTrial] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        setLoading(true);
        // Add cache-busting query parameter to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/community/${slug}?t=${timestamp}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch community data");
        }
        
        const data = await response.json();
        console.log('Community data received:', data);
        
        if (data && data._id) {
          const billingData = {
            _id: data._id.toString(),
            adminTrialInfo: data.adminTrialInfo,
            paymentStatus: data.paymentStatus,
            subscriptionEndDate: data.subscriptionEndDate,
            freeTrialActivated: data.freeTrialActivated,
          };
          
          console.log('Setting billing info:', billingData);
          setBillingInfo(billingData);
        }
      } catch (err) {
        console.error("Error fetching billing info:", err);
        setError("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    // Fetch billing info once when component mounts
    fetchBillingInfo();
  }, [slug]);

  // Direct trial activation function for troubleshooting
  const activateTrialDirectly = async () => {
    if (!slug || !session?.user?.id) return;
    
    try {
      setActivatingTrial(true);
      setError(null);
      
      // Call the new direct trial activation endpoint
      const response = await fetch(`/api/community/${slug}/activate-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate trial');
      }
      
      const data = await response.json();
      console.log('Trial activation response:', data);
      
      // Set success state
      setActivationSuccess(true);
      
      // Update the billing info without refreshing the page
      if (data.community) {
        setBillingInfo({
          _id: data.community._id,
          adminTrialInfo: data.community.adminTrialInfo,
          paymentStatus: data.community.paymentStatus,
          subscriptionEndDate: data.community.subscriptionEndDate,
          freeTrialActivated: data.community.freeTrialActivated
        });
      }
    } catch (err) {
      console.error('Error activating trial directly:', err);
      setError(err instanceof Error ? err.message : 'Failed to activate trial');
    } finally {
      setActivatingTrial(false);
    }
  };
  
  // Function to cancel the trial
  const cancelTrial = async () => {
    if (!slug || !session?.user?.id) return;
    
    if (!confirm("Are you sure you want to cancel your trial? This will immediately suspend your community until you subscribe.")) {
      return;
    }
    
    try {
      setCancellingTrial(true);
      setError(null);
      
      // Call the trial cancellation endpoint
      const response = await fetch(`/api/community/${slug}/cancel-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel trial');
      }
      
      const data = await response.json();
      console.log('Trial cancellation response:', data);
      
      // Set success state
      setCancelSuccess(true);
      
      // Update the billing info without refreshing the page
      if (data.community) {
        setBillingInfo({
          _id: data.community._id,
          adminTrialInfo: { activated: false, startDate: undefined, endDate: undefined },
          paymentStatus: data.community.paymentStatus,
          subscriptionEndDate: undefined,
          freeTrialActivated: false
        });
      }
      
      // Show success message
      alert('Trial cancelled successfully. Your community has been suspended until you subscribe.');
      
      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      console.error('Error cancelling trial:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel trial');
    } finally {
      setCancellingTrial(false);
    }
  };

  // Calculate days remaining in trial
  const calculateDaysRemaining = () => {
    if (!billingInfo?.adminTrialInfo?.endDate) return 0;
    
    const endDate = new Date(billingInfo.adminTrialInfo.endDate);
    const today = new Date();
    
    // Calculate difference in days
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Check if trial is active using both adminTrialInfo and freeTrialActivated
  const isTrialActive = () => {
    return (billingInfo?.adminTrialInfo?.activated === true || billingInfo?.paymentStatus === 'trial' || billingInfo?.freeTrialActivated === true) && calculateDaysRemaining() > 0;
  };

  // Format date to a readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 rounded-lg flex items-center gap-3 text-error">
        <AlertCircle className="w-6 h-6" />
        <p>{error}</p>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining();
  const trialActive = isTrialActive();
  const percentRemaining = trialActive ? (daysRemaining / 14) * 100 : 0;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Billing & Subscription</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Trial Status
            </h3>
            
            {billingInfo?.adminTrialInfo?.activated || billingInfo?.freeTrialActivated ? (
              <div className="space-y-4">
                <div className="alert alert-success">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <p>Trial is active! You have access to all premium features.</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Trial Period:</span>
                  <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>{daysRemaining} days remaining</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${percentRemaining}%`, backgroundColor: "var(--brand-primary)" }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  {billingInfo?.adminTrialInfo?.startDate && (
                    <span>Started: {formatDate(billingInfo.adminTrialInfo.startDate)}</span>
                  )}
                  {billingInfo?.adminTrialInfo?.endDate && (
                    <span>Ends: {formatDate(billingInfo.adminTrialInfo.endDate)}</span>
                  )}
                </div>
                
                {/* Cancel Trial Button */}
                <div className="mt-4">
                  <button
                    onClick={cancelTrial}
                    disabled={cancellingTrial}
                    className="btn btn-outline btn-error w-full"
                  >
                    {cancellingTrial ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling Trial...
                      </>
                    ) : (
                      "Cancel Trial"
                    )}
                  </button>
                  {cancelSuccess && (
                    <div className="alert alert-success mt-2">
                      <p>Trial cancelled successfully. Your community has been suspended.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="alert alert-warning">
                  <p>Trial not activated yet. Please visit the billing page after creating your community to activate your free trial.</p>
                </div>
                
                {activationSuccess ? (
                  <div className="alert alert-success">
                    <p>Trial activated successfully! The page will refresh shortly.</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-error">
                    <p>{error}</p>
                  </div>
                ) : null}
                
                <Link 
                  href={`/billing/${slug}`}
                  className="btn btn-primary w-full"
                >
                  Go to Billing Page
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h3 className="card-title flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Subscription Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Status:</span>
                <span className={`font-semibold ${
                  billingInfo?.paymentStatus === "paid" ? "text-success" :
                  billingInfo?.paymentStatus === "trial" ? "text-warning" :
                  "text-error"
                }`}>
                  {billingInfo?.paymentStatus === "paid" ? "Active" :
                   billingInfo?.paymentStatus === "trial" ? "Trial" :
                   billingInfo?.paymentStatus === "expired" ? "Expired" : "Unpaid"}
                </span>
              </div>
              
              {billingInfo?.paymentStatus === "paid" && billingInfo?.subscriptionEndDate && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Renews On:</span>
                  <span>{formatDate(billingInfo.subscriptionEndDate)}</span>
                </div>
              )}
              
              {(billingInfo?.paymentStatus === "unpaid" || billingInfo?.paymentStatus === "expired" || billingInfo?.paymentStatus === "trial") && (
                <div className="mt-4">
                  <Link 
                    href={`/billing/${slug}`}
                    className="btn btn-primary btn-block"
                  >
                    Upgrade Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h3 className="card-title">Billing History</h3>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {billingInfo?.adminTrialInfo?.activated ? (
                  <tr>
                    <td>{formatDate(billingInfo.adminTrialInfo.startDate)}</td>
                    <td>14-Day Free Trial</td>
                    <td>$0.00</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4">No billing history available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
