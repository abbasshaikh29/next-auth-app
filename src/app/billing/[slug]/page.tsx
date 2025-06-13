"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";
import RazorpayCheckout from "@/components/payments/RazorpayCheckout";
import { apiClient } from "@/lib/api-client";

// Import ICommunity type to ensure compatibility
import { ICommunity } from "@/models/Community";

// Create a simplified version of ICommunity for our needs
interface CommunityData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  adminTrialInfo?: {
    activated: boolean;
    startDate?: string;
    endDate?: string;
  };
  paymentStatus?: string;
  freeTrialActivated?: boolean;
  subscriptionEndDate?: string;
}

export default function BillingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skipPayment, setSkipPayment] = useState(false);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [trialActive, setTrialActive] = useState(false);
  const [isPaymentActive, setIsPaymentActive] = useState(false);
  const [trialEligible, setTrialEligible] = useState(true);
  const [trialEligibilityReason, setTrialEligibilityReason] = useState<string | null>(null);
  const [communitySuspended, setCommunitySuspended] = useState(false);

  const slug = params?.slug as string;

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Check URL parameters for suspension status
        const urlParams = new URLSearchParams(window.location.search);
        const suspended = urlParams.get('suspended') === 'true';
        setCommunitySuspended(suspended);

        const communityData = await apiClient.getcommunity(slug);

        // Convert the ICommunity data to CommunityData format
        // Ensure _id is a string (it might be an ObjectId from MongoDB)
        const communityId = communityData._id;
        let idAsString = '';

        if (communityId) {
          if (typeof communityId === 'object' && communityId.toString) {
            idAsString = communityId.toString();
          } else if (typeof communityId === 'string') {
            idAsString = communityId;
          }
        }

        // Check trial eligibility if user is authenticated
        if (session?.user?.id) {
          try {
            const eligibilityResponse = await fetch(`/api/trial/check-eligibility`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                trialType: 'community',
                communityId: idAsString
              })
            });

            if (eligibilityResponse.ok) {
              const eligibilityData = await eligibilityResponse.json();
              setTrialEligible(eligibilityData.eligible);
              setTrialEligibilityReason(eligibilityData.reason);
            }
          } catch (err) {
            console.error('Error checking trial eligibility:', err);
          }
        }

        // Convert any Date objects to strings
        const subscriptionEndDateStr = communityData.subscriptionEndDate
          ? typeof communityData.subscriptionEndDate === 'string'
            ? communityData.subscriptionEndDate
            : communityData.subscriptionEndDate.toString()
          : undefined;

        // Check if admin trial is active and calculate remaining days
        let remainingTrialDays = null;
        let isTrialActive = false;
        let isPaid = communityData.paymentStatus === 'paid';

        if (communityData.adminTrialInfo?.activated && communityData.adminTrialInfo?.endDate) {
          const endDate = new Date(communityData.adminTrialInfo.endDate);
          const today = new Date();
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 0) {
            remainingTrialDays = diffDays;
            isTrialActive = true;
          }
        }

        setIsPaymentActive(isPaid);

        setRemainingDays(remainingTrialDays);
        setTrialActive(isTrialActive);

        // Convert Date objects to strings for the adminTrialInfo
        const adminTrialInfoFormatted = communityData.adminTrialInfo ? {
          activated: communityData.adminTrialInfo.activated,
          startDate: communityData.adminTrialInfo.startDate ? communityData.adminTrialInfo.startDate.toString() : undefined,
          endDate: communityData.adminTrialInfo.endDate ? communityData.adminTrialInfo.endDate.toString() : undefined
        } : undefined;

        setCommunity({
          _id: idAsString,
          name: communityData.name || '',
          slug: communityData.slug || '',
          description: communityData.description,
          adminTrialInfo: adminTrialInfoFormatted,
          paymentStatus: communityData.paymentStatus,
          freeTrialActivated: communityData.freeTrialActivated,
          subscriptionEndDate: subscriptionEndDateStr
        });
      } catch (err) {
        setError("Failed to load community information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCommunity();
    }
  }, [slug, session]);

  const handlePaymentSuccess = async (data: any) => {
    try {
      if (!community?._id) {
        throw new Error('Community ID not found');
      }
      
      // Update the community with payment information using the API client method
      await apiClient.completeCommunityPayment(community._id, {
        transactionId: data.transaction.id,
        paymentId: data.payment.id,
        freeTrialActivated: false
      });
      
      // Redirect to the community page
      router.push(`/Newcompage/${slug}`);
    } catch (err) {
      setError("Payment was successful but we couldn't update your community. Please contact support.");
      console.error(err);
    }
  };

  const handlePaymentError = (error: any) => {
    setError("Payment failed: " + (error.description || error.message || "Unknown error"));
    console.error("Payment error:", error);
  };

  // Function to handle trial cancellation
  const handleCancelTrial = async () => {
    if (!confirm("Are you sure you want to cancel your trial? This will immediately suspend your community until you subscribe.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/community/${slug}/cancel-trial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to cancel trial');
      }
      
      const data = await response.json();
      
      // Show success message
      alert('Trial cancelled successfully. Your community has been suspended until you subscribe.');
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      console.error('Error cancelling trial:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel trial');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPayment = async () => {
    try {
      if (!community?._id || !session?.user?.id) {
        throw new Error('Community ID or user ID not found');
      }
      
      setLoading(true);
      setSkipPayment(true);
      
      console.log('Activating trial for community:', community._id);
      
      // Activate free trial using the API client method
      const response = await apiClient.activateCommunityTrial(community._id, session.user.id);
      console.log('Trial activation response:', response);
      
      // Fetch updated community data
      const updatedCommunity = await apiClient.getcommunity(slug);
      console.log('Updated community data:', updatedCommunity);
      
      // Update local state with the new data
      setCommunity({
        ...community,
        adminTrialInfo: updatedCommunity.adminTrialInfo ? {
          activated: updatedCommunity.adminTrialInfo.activated,
          startDate: updatedCommunity.adminTrialInfo.startDate ? updatedCommunity.adminTrialInfo.startDate.toString() : undefined,
          endDate: updatedCommunity.adminTrialInfo.endDate ? updatedCommunity.adminTrialInfo.endDate.toString() : undefined
        } : undefined,
        paymentStatus: updatedCommunity.paymentStatus,
        freeTrialActivated: updatedCommunity.freeTrialActivated,
        subscriptionEndDate: updatedCommunity.subscriptionEndDate ? updatedCommunity.subscriptionEndDate.toString() : undefined
      });
      
      // Check if trial is active using both adminTrialInfo and freeTrialActivated
      const isTrialActive = (
        (community?.adminTrialInfo?.activated && 
         community?.adminTrialInfo?.endDate && 
         new Date(community.adminTrialInfo.endDate) > new Date()) ||
        (community?.paymentStatus === 'trial') ||
        (community?.freeTrialActivated === true && 
         community?.subscriptionEndDate && 
         new Date(community.subscriptionEndDate) > new Date())
      );
      
      // Check if payment is already active
      const isPaymentActive = community?.paymentStatus === 'paid';
      
      // Calculate remaining days for the updated trial
      if (isTrialActive) {
        // Add null check for subscriptionEndDate before creating a Date object
        const endDate = updatedCommunity.adminTrialInfo?.endDate 
          ? new Date(updatedCommunity.adminTrialInfo.endDate) 
          : updatedCommunity.subscriptionEndDate 
            ? new Date(updatedCommunity.subscriptionEndDate) 
            : new Date(); // Fallback to current date if both are undefined
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          setRemainingDays(diffDays);
          setTrialActive(true);
        }
      }
      
      // Show success message
      alert('Free trial activated successfully! You now have 14 days to explore all premium features.');
      
      // Redirect to the community page after a short delay
      setTimeout(() => {
        router.push(`/Newcompage/${slug}`);
      }, 1500);
    } catch (err) {
      setError("Failed to activate free trial. Please try again.");
      console.error('Trial activation error:', err);
    } finally {
      setLoading(false);
      setSkipPayment(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--brand-primary)" }} />
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => router.back()} 
              className="btn btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div
          className="max-w-3xl mx-auto p-8 rounded-lg shadow-lg transition-colors duration-300"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: "var(--text-primary)" }}>
            Complete Your Community Setup
          </h1>
          
          {community && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">{community.name}</h2>
              {community.description && (
                <p className="text-gray-600">{community.description}</p>
              )}

              {/* Show suspension notice if community was suspended */}
              {communitySuspended && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-red-800 font-semibold">Community Suspended</h3>
                      <p className="text-red-700 text-sm mt-1">
                        Your community has been suspended due to trial expiration. Subscribe now to reactivate access for all members.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div
            className="border-l-4 p-4 mb-8 transition-colors duration-300"
            style={{
              backgroundColor: "var(--bg-accent)",
              borderColor: "var(--brand-primary)"
            }}
          >
            <h3 className="font-bold" style={{ color: "var(--brand-primary)" }}>Subscription Details</h3>
            <p className="mt-2">
              Your community subscription costs ₹39/month, but as the admin, you can start with a 14-day free trial.
              After the trial period, your payment method will be automatically charged.
            </p>
            
            {trialActive && remainingDays !== null && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">Trial Period</span>
                  <span className="font-semibold" style={{ color: "var(--brand-primary)" }}>{remainingDays} days remaining</span>
                </div>
                {/* Enhanced progress bar with day markers */}
                <div className="relative pt-1 pb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${(remainingDays / 14) * 100}%`,
                        backgroundColor: "var(--brand-primary)"
                      }}
                    ></div>
                  </div>
                  
                  {/* Day markers */}
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Day 1</span>
                    <span>Day 7</span>
                    <span>Day 14</span>
                  </div>
                </div>
                
                {/* Trial dates */}
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  {community?.adminTrialInfo?.startDate && (
                    <span>Started: {new Date(community.adminTrialInfo.startDate).toLocaleDateString()}</span>
                  )}
                  {community?.adminTrialInfo?.endDate && (
                    <span>Ends: {new Date(community.adminTrialInfo.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {isPaymentActive ? (
            <div className="card bg-white border border-green-200 shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">Active Subscription</h3>
                  <p className="text-green-600">
                    Your community has an active paid subscription until {community?.subscriptionEndDate ? new Date(community.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <div className="w-full md:w-1/2">
                <div
                  className="card border p-6 h-full transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--brand-primary)",
                    boxShadow: "var(--shadow-md)"
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold" style={{ color: "var(--brand-primary)" }}>Start with 14-Day Free Trial</h3>
                    <span className="badge bg-blue-100 text-blue-800 border-none">Recommended</span>
                  </div>
                  <p className="mb-6">
                    As the admin, try all premium features for 14 days without any charge. This trial is exclusive to you as the community admin.
                    After the trial period, you'll be billed $29/month (charged in INR).
                  </p>
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Full access to all premium features
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      No credit card required
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cancel anytime
                    </li>
                  </ul>
                  {trialActive ? (
                    <div className="space-y-3 mt-auto">
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-green-700 font-medium">Your admin trial is active</p>
                        <p className="text-sm text-green-600 mt-1">{remainingDays} days remaining</p>
                      </div>
                      <button
                        onClick={() => handleCancelTrial()}
                        className="btn btn-outline btn-error w-full"
                      >
                        Cancel Trial
                      </button>
                    </div>
                  ) : !trialEligible ? (
                    <div className="space-y-3 mt-auto">
                      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-orange-700 font-medium">Trial Not Available</p>
                        <p className="text-sm text-orange-600 mt-1">{trialEligibilityReason}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-blue-700 text-sm">
                          <strong>Subscribe now</strong> to access all premium features
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleSkipPayment}
                      disabled={skipPayment || loading}
                      className="btn bg-primary text-white hover:bg-primary/90 border-none w-full mt-auto"
                    >
                      {skipPayment ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Activate Free Trial"
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-left md:py-4">
                <span className="text-gray-500">or</span>
              </div>
              
              <div className="w-full md:w-1/2">
                <div
                  className="card border p-6 h-full transition-all duration-300 hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-color)",
                    boxShadow: "var(--shadow-md)"
                  }}
                >
                  <h3 className="text-xl font-bold mb-4" style={{ color: "var(--brand-primary)" }}>Pay Now</h3>
                  <p className="mb-6">
                    Skip the trial and start your subscription immediately. You'll be charged $29/month
                    starting today. Payment will be processed in INR equivalent (approx. ₹2,523).
                  </p>
                  <ul className="mb-6 space-y-2">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Full access to all premium features
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Flexible monthly billing
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Priority support
                    </li>
                  </ul>
                  <RazorpayCheckout
                    amount={2523}
                    currency="INR"
                    paymentType="community"
                    communityId={community?._id}
                    buttonText="Subscribe Now ($29/month)"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
