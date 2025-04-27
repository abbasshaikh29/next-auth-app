"use client";
import React from "react";
import Header from "@/components/Header";
import { Check, X } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="bg-white py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-halloween-purple via-halloween-orange to-halloween-green opacity-30"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-halloween-orange opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-halloween-purple opacity-5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-halloween-orange/10 text-halloween-orange rounded-full text-sm font-medium mb-4">
              🎃 Halloween Special Offer
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-halloween-purple">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-halloween-black/70 max-w-2xl mx-auto mb-8">
              Everything you need to build and grow your community at an affordable price.
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 mb-16">
            {/* Our Plan */}
            <div className="flex-1">
              <div className="card bg-white border border-halloween-orange/20 shadow-halloween hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-halloween-orange opacity-50"></div>
                <div className="card-body p-8">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-2xl font-bold text-halloween-orange">
                      TheTribelab Premium
                    </h3>
                    <div className="badge badge-lg bg-halloween-orange/10 text-halloween-orange border-halloween-orange/20">
                      Best Value
                    </div>
                  </div>
                  <div className="mt-4 mb-6">
                    <span className="text-5xl font-bold text-halloween-black">
                      $39
                    </span>
                    <span className="text-halloween-black/60">/month</span>
                    <p className="text-sm text-halloween-black/60 mt-2">
                      Billed monthly. No contracts, cancel anytime.
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Unlimited members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Advanced analytics and reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Custom branding and white-labeling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Priority support (24/7 response time)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Community forums and discussion boards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Live streaming and video hosting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Course creation and management</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-halloween-orange/10 flex items-center justify-center text-halloween-orange flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Monetization tools (subscriptions, one-time payments)</span>
                    </li>
                  </ul>
                  <div className="card-actions mt-auto">
                    <Link href="/communityform" className="w-full">
                      <button
                        type="button"
                        className="btn bg-halloween-orange text-white hover:bg-halloween-orange/90 w-full border-none hover:shadow-md hover:shadow-halloween-orange/20 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Get Started Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skool Plan */}
            <div className="flex-1">
              <div className="card bg-white border border-skool-primary/20 shadow-skool hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-skool-primary opacity-50"></div>
                <div className="card-body p-8">
                  <div className="flex justify-between items-start">
                    <h3 className="card-title text-2xl font-bold text-skool-primary">
                      Skool Premium
                    </h3>
                    <div className="badge badge-lg bg-skool-primary/10 text-skool-primary border-skool-primary/20">
                      Competitor
                    </div>
                  </div>
                  <div className="mt-4 mb-6">
                    <span className="text-5xl font-bold text-skool-text">
                      $99
                    </span>
                    <span className="text-skool-light-text">/month</span>
                    <p className="text-sm text-skool-light-text mt-2">
                      Billed monthly. Annual plans available.
                    </p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Unlimited members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Basic analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Limited branding options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Standard support (48hr response time)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Community forums</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Basic video hosting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-skool-primary/10 flex items-center justify-center text-skool-primary flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>Course creation tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </span>
                      <span className="text-skool-light-text">Limited monetization options</span>
                    </li>
                  </ul>
                  <div className="card-actions mt-auto opacity-60">
                    <button
                      type="button"
                      disabled
                      className="btn bg-skool-primary text-white w-full border-none cursor-not-allowed"
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
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-halloween-purple">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-base-200">
                    <th className="text-left p-4 border-b">Feature</th>
                    <th className="text-center p-4 border-b text-halloween-orange">TheTribelab ($39/mo)</th>
                    <th className="text-center p-4 border-b text-skool-primary">Skool ($99/mo)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Unlimited Members</td>
                    <td className="text-center p-4 border-b text-halloween-orange"><Check className="w-5 h-5 mx-auto" /></td>
                    <td className="text-center p-4 border-b text-skool-primary"><Check className="w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Advanced Analytics</td>
                    <td className="text-center p-4 border-b text-halloween-orange"><Check className="w-5 h-5 mx-auto" /></td>
                    <td className="text-center p-4 border-b text-skool-primary"><X className="w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Custom Branding</td>
                    <td className="text-center p-4 border-b text-halloween-orange"><Check className="w-5 h-5 mx-auto" /></td>
                    <td className="text-center p-4 border-b text-skool-primary">Limited</td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Priority Support</td>
                    <td className="text-center p-4 border-b text-halloween-orange"><Check className="w-5 h-5 mx-auto" /></td>
                    <td className="text-center p-4 border-b text-skool-primary"><X className="w-5 h-5 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Live Streaming</td>
                    <td className="text-center p-4 border-b text-halloween-orange"><Check className="w-5 h-5 mx-auto" /></td>
                    <td className="text-center p-4 border-b text-skool-primary">Limited</td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Monetization Tools</td>
                    <td className="text-center p-4 border-b text-halloween-orange"><Check className="w-5 h-5 mx-auto" /></td>
                    <td className="text-center p-4 border-b text-skool-primary">Limited</td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Monthly Price</td>
                    <td className="text-center p-4 border-b font-bold text-halloween-orange">$39</td>
                    <td className="text-center p-4 border-b font-bold text-skool-primary">$99</td>
                  </tr>
                  <tr className="hover:bg-base-100">
                    <td className="p-4 border-b">Annual Savings</td>
                    <td className="text-center p-4 border-b font-bold text-halloween-orange">$720/year</td>
                    <td className="text-center p-4 border-b text-skool-primary">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-halloween-purple">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card bg-white border border-halloween-purple/10 shadow-halloween p-6">
                <h3 className="text-xl font-bold mb-2 text-halloween-purple">Can I cancel anytime?</h3>
                <p>Yes, you can cancel your subscription at any time. There are no long-term contracts or commitments.</p>
              </div>
              <div className="card bg-white border border-halloween-purple/10 shadow-halloween p-6">
                <h3 className="text-xl font-bold mb-2 text-halloween-purple">Is there a free trial?</h3>
                <p>We offer a 14-day free trial so you can test all premium features before committing.</p>
              </div>
              <div className="card bg-white border border-halloween-purple/10 shadow-halloween p-6">
                <h3 className="text-xl font-bold mb-2 text-halloween-purple">Do you offer refunds?</h3>
                <p>We offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
              </div>
              <div className="card bg-white border border-halloween-purple/10 shadow-halloween p-6">
                <h3 className="text-xl font-bold mb-2 text-halloween-purple">Are there any hidden fees?</h3>
                <p>No hidden fees. The price you see is the price you pay. All features are included in the $39/month plan.</p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-halloween-purple">
              Ready to Build Your Community?
            </h2>
            <p className="text-lg text-halloween-black/70 max-w-2xl mx-auto mb-8">
              Get started today and take advantage of our special pricing.
            </p>
            <Link href="/communityform">
              <button
                type="button"
                className="btn bg-halloween-orange text-white hover:bg-halloween-orange/90 px-8 py-3 text-lg border-none hover:shadow-md hover:shadow-halloween-orange/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                Start Your 14-Day Free Trial
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
