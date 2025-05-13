"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import TransactionHistory from "@/components/payments/TransactionHistory";

export default function PaymentHistoryPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("outgoing");

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-halloween-purple mb-2">
            Payment History
          </h1>
          <p className="text-halloween-black/70">
            View your payment history and manage your subscriptions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <Tabs defaultValue="outgoing" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="outgoing" className="px-6">
                Payments Made
              </TabsTrigger>
              <TabsTrigger value="incoming" className="px-6">
                Payments Received
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="outgoing">
              <h2 className="text-xl font-bold mb-4">Payments You've Made</h2>
              <TransactionHistory type="payer" />
            </TabsContent>
            
            <TabsContent value="incoming">
              <h2 className="text-xl font-bold mb-4">Payments You've Received</h2>
              <TransactionHistory type="payee" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Subscription Management Section */}
        {activeTab === "outgoing" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-halloween-purple">
              Active Subscriptions
            </h2>
            
            {/* This would be replaced with actual subscription data */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-center text-halloween-black/70">
                Your active subscriptions will appear here.
              </p>
            </div>
          </div>
        )}

        {/* Payment Methods Section */}
        {activeTab === "outgoing" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-halloween-purple">
              Payment Methods
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-center text-halloween-black/70">
                Your saved payment methods will appear here.
              </p>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="btn bg-halloween-orange text-white hover:bg-halloween-orange/90 border-none"
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payout Settings Section */}
        {activeTab === "incoming" && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-halloween-purple">
              Payout Settings
            </h2>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <p className="text-center text-halloween-black/70">
                Configure your payout settings to receive payments from your community members.
              </p>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="btn bg-halloween-orange text-white hover:bg-halloween-orange/90 border-none"
                >
                  Set Up Payouts
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
