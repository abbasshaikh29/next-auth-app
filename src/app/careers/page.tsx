"use client";

import React from "react";
import Header from "@/components/Header";

export default function CareersPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-halloween-purple text-center">
          Careers
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <p className="text-center mb-8">
            Join our team and help us build the future of community platforms.
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
