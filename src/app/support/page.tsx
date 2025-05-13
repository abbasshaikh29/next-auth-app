"use client";

import React from "react";
import Header from "@/components/Header";

export default function SupportPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-halloween-purple text-center">
          Support
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <p className="text-center mb-8">
            Need help? Our support team is here to assist you with any questions or issues.
          </p>
          
          <div className="flex justify-center">
            <a href="/" className="btn btn-primary">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
