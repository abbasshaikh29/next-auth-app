"use client";

import React, { useState } from "react";
import { useNotification } from "@/components/Notification";

export default function ManualVerify() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification("Email is required", "error");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/manual-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification(data.message, "success");
        setEmail("");
      } else {
        showNotification(data.error || "Failed to verify email", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Manual Email Verification (Development Only)
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email to verify"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This tool is for development purposes only.</p>
          <p>It allows you to manually verify a user's email without going through the email verification process.</p>
        </div>
      </div>
    </div>
  );
}
