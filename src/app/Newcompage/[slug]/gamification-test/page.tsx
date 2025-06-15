"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import GamificationTest from "@/components/gamification/GamificationTest";
import { Shield, AlertTriangle } from "lucide-react";

export default function GamificationTestPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/community/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCommunity(data);
        
        // Check if user is admin
        if (session?.user?.id) {
          const userId = session.user.id;
          setIsAdmin(
            data.admin === userId || data.subAdmins?.includes(userId)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching community:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only show in development environment
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--brand-error)' }} />
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Test Page Not Available
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              This test page is only available in development environment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Community Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The community you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to test the gamification system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gamification System Test
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Test and verify the gamification system functionality for {community.name}.
          </p>
        </div>

        {/* Development Warning */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                Development Environment Only
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This test page is only available in development. In production, points are awarded automatically when users receive likes on their posts and comments.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Notice */}
        {isAdmin && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-200">
                  Admin Access
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  As a community admin, you can customize level names in Community Settings → Level Management.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Component */}
        <GamificationTest communityId={community._id} />

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">How to Test</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Use the test controls to award yourself points and see level progression</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Check the leaderboard to see your ranking among community members</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Navigate to the main community page to see level badges on posts and comments</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Hover over usernames to see detailed gamification information</span>
            </div>
            {isAdmin && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>As an admin, test the level management feature in Community Settings</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
