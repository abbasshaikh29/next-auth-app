"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PaymentPlansList from "@/components/payments/PaymentPlansList";
import RazorpayCheckout from "@/components/payments/RazorpayCheckout";
import StartTrialButton from "@/components/payments/StartTrialButton";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = (data: any) => {
    setPaymentSuccess(true);
    setPaymentError(null);
    console.log("Payment successful:", data);
  };

  const handlePaymentError = (error: any) => {
    setPaymentSuccess(false);
    setPaymentError(error instanceof Error ? error.message : "Payment failed");
    console.error("Payment error:", error);
  };

  // Note: We display prices in USD ($29) for marketing purposes,
  // but process payments in INR (₹2400) for local payment processing

  return (
    <main className="min-h-screen">
      <Header />

      <div className="py-16 relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: "var(--bg-primary)" }}>
        {/* Modern decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-30" style={{ backgroundImage: "linear-gradient(to right, var(--brand-primary), var(--brand-secondary), var(--brand-accent))" }}></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 opacity-5 rounded-full blur-3xl" style={{ backgroundColor: "var(--brand-primary)" }}></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 opacity-5 rounded-full blur-3xl" style={{ backgroundColor: "var(--brand-secondary)" }}></div>

        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
              ✨ Professional Community Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
              Everything you need to build and grow your community at an
              affordable price.
            </p>
          </div>

          {/* Payment Success/Error Messages */}
          {paymentSuccess && (
            <div className="alert alert-success mb-8">
              <p>Payment successful! Your account has been upgraded.</p>
            </div>
          )}

          {paymentError && (
            <div className="alert alert-error mb-8">
              <p>Payment error: {paymentError}</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 mb-16">
            {/* Our Plan */}
            <div className="flex-1">
              <div className="card border hover:shadow-lg transition-all duration-300 overflow-hidden h-full" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--brand-primary)", opacity: 0.8 }}>
                <div className="absolute top-0 left-0 w-full h-1 opacity-70" style={{ backgroundColor: "var(--brand-primary)" }}></div>
                <div className="card-body p-8">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
                      TheTribelab Premium
                    </h3>
                    <div className="badge badge-lg" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                      Best Value
                    </div>
                  </div>
                  <div className="mt-4 mb-6">
                    <span className="text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
                      $29
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>/month</span>
                    <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                      Billed monthly. No contracts, cancel anytime.
                    </p>
                    <div className="mt-2 px-3 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                      Start with a 14-day free trial. No payment required.
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Unlimited members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Advanced analytics and reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Custom branding and white-labeling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Priority support (24/7 response time)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Community forums and discussion boards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Live streaming and video hosting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>Course creation and management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--brand-primary)", color: "white", opacity: 0.9 }}>
                        <Check className="w-3 h-3" />
                      </span>
                      <span style={{ color: "var(--text-primary)" }}>
                        Monetization tools (subscriptions, one-time payments)
                      </span>
                    </li>
                  </ul>
                  <div className="card-actions mt-auto flex flex-col gap-3 w-full">
                    {session ? (
                      <>
                        <StartTrialButton
                          buttonText="Start 14-Day Free Trial"
                          className="btn bg-success text-white hover:bg-success/90 w-full border-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                        <div className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                          or
                        </div>
                        <RazorpayCheckout
                          amount={2400}
                          currency="INR"
                          paymentType="platform"
                          buttonText="Subscribe Now"
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      </>
                    ) : (
                      <Link href="/api/auth/signin" className="w-full">
                        <button
                          type="button"
                          className="btn bg-primary text-white hover:bg-primary/90 w-full border-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                          Sign In to Get Started
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Competitor Plan */}
            <div className="flex-1">
              <div className="card bg-white border border-neutral-300/20 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-neutral-500 opacity-50"></div>
                <div className="card-body p-8">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-2xl font-bold text-neutral-600">
                      Competitor Premium
                    </h3>
                    <div className="badge badge-lg bg-neutral-200 text-neutral-600 border-neutral-300/20">
                      Competitor
                    </div>
                  </div>
                  <div className="mt-4 mb-6">
                    <span className="text-5xl font-bold text-neutral-700">
                      $99
                    </span>
                    <span className="text-neutral-500">/month</span>
                    <p className="text-sm text-neutral-500 mt-2">
                      Billed monthly. Annual plans available.
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Unlimited members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Limited branding options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Standard support (48hr response time)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Community forums</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Basic video hosting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Course creation tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </span>
                      <span className="text-neutral-500">
                        Limited monetization options
                      </span>
                    </li>
                  </ul>
                  <div className="card-actions mt-auto opacity-60">
                    <button
                      type="button"
                      disabled
                      className="btn bg-neutral-600 text-white w-full border-none cursor-not-allowed"
                    >
                      Competitor Option
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: "var(--text-primary)" }}>
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-left p-4 border-b">Feature</th>
                    <th className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      TheTribelab ($29/mo)
                    </th>
                    <th className="text-center p-4 border-b text-neutral-600">
                      Competitor ($99/mo)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Unlimited Members</td>
                    <td className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Advanced Analytics</td>
                    <td className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      <X className="w-5 h-5 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Custom Branding</td>
                    <td className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      Limited
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Priority Support</td>
                    <td className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      <X className="w-5 h-5 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Live Streaming</td>
                    <td className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      Limited
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Monetization Tools</td>
                    <td className="text-center p-4 border-b" style={{ color: "var(--brand-primary)" }}>
                      <Check className="w-5 h-5 mx-auto" />
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      Limited
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Monthly Price</td>
                    <td className="text-center p-4 border-b font-bold" style={{ color: "var(--brand-primary)" }}>
                      $29
                    </td>
                    <td className="text-center p-4 border-b font-bold text-neutral-600">
                      $99
                    </td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Annual Savings</td>
                    <td className="text-center p-4 border-b font-bold" style={{ color: "var(--brand-primary)" }}>
                      $348/year
                    </td>
                    <td className="text-center p-4 border-b text-neutral-600">
                      N/A
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: "var(--text-primary)" }}>
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="card border p-6 transition-all duration-300"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brand-primary)" }}>
                  Can I cancel anytime?
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  Yes, you can cancel your subscription at any time. There are
                  no long-term contracts or commitments.
                </p>
              </div>
              <div
                className="card border p-6 transition-all duration-300"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brand-primary)" }}>
                  Is there a free trial?
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  We offer a 14-day free trial so you can test all premium
                  features before committing.
                </p>
              </div>
              <div
                className="card border p-6 transition-all duration-300"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brand-primary)" }}>
                  Do you offer refunds?
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  We offer a 30-day money-back guarantee if you're not satisfied
                  with our service.
                </p>
              </div>
              <div
                className="card border p-6 transition-all duration-300"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  boxShadow: "var(--shadow-md)"
                }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: "var(--brand-primary)" }}>
                  Are there any hidden fees?
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  No hidden fees. The price you see is the price you pay. All
                  features are included in the $29/month plan.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Ready to Build Your Community?
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
              Get started with a 14-day free trial. No credit card required.
            </p>
            {session ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <StartTrialButton
                  buttonText="Start Free Trial"
                  className="btn bg-success text-white hover:bg-success/90 px-8 py-3 text-lg border-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                <RazorpayCheckout
                  amount={2400}
                  currency="INR"
                  paymentType="platform"
                  buttonText="Subscribe Now"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            ) : (
              <Link href="/api/auth/signin">
                <button
                  type="button"
                  className="btn bg-primary text-white hover:bg-primary/90 px-8 py-3 text-lg border-none hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign In to Get Started
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
