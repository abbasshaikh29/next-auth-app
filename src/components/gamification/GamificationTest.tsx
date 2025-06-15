"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LevelBadge from "./LevelBadge";
import ProgressBar from "./ProgressBar";
import Leaderboard from "./Leaderboard";

interface GamificationTestProps {
  communityId: string;
}

const GamificationTest: React.FC<GamificationTestProps> = ({ communityId }) => {
  const { data: session } = useSession();
  const [gamificationData, setGamificationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchGamificationData();
    }
  }, [session?.user?.id, communityId]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/gamification/user/${session?.user?.id}?communityId=${communityId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch gamification data");
      }

      const data = await response.json();
      setGamificationData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const awardTestPoints = async (points: number) => {
    try {
      const response = await fetch("/api/gamification/test-award", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          points,
          communityId,
        }),
      });

      if (response.ok) {
        // Refresh data after awarding points
        fetchGamificationData();
      }
    } catch (error) {
      console.error("Error awarding test points:", error);
    }
  };

  if (!session?.user) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ color: 'var(--text-primary)' }}>Please log in to test the gamification system.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 rounded w-1/3" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
          <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
          <div className="h-20 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ color: 'var(--brand-error)' }}>
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <button
            onClick={fetchGamificationData}
            className="mt-2 px-4 py-2 text-white rounded transition-colors"
            style={{ backgroundColor: 'var(--brand-primary)' }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Gamification System Test</h2>
        
        {/* Current User Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Your Current Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <LevelBadge
                  level={gamificationData?.currentLevel?.level || 1}
                  levelName={gamificationData?.currentLevel?.name}
                  size="lg"
                  position="inline"
                />
                <div>
                  <p className="font-medium">Current Level</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {gamificationData?.currentLevel?.name || "Newbie"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="font-medium">Total Points</p>
              <p className="text-2xl font-bold text-blue-600">
                {gamificationData?.points || 0}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="font-medium">Monthly Points</p>
              <p className="text-2xl font-bold text-green-600">
                {gamificationData?.monthlyPoints || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {gamificationData?.currentLevel && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Level Progress</h3>
            <ProgressBar
              currentPoints={gamificationData.points}
              pointsToNext={gamificationData.currentLevel.pointsToNext}
              progress={gamificationData.currentLevel.progress}
              currentLevelName={gamificationData.currentLevel.name}
              nextLevelName={gamificationData.nextLevel?.name}
            />
          </div>
        )}

        {/* Test Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => awardTestPoints(1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              +1 Point
            </button>
            <button
              onClick={() => awardTestPoints(5)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              +5 Points
            </button>
            <button
              onClick={() => awardTestPoints(20)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              +20 Points
            </button>
            <button
              onClick={() => awardTestPoints(-1)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              -1 Point
            </button>
            <button
              onClick={fetchGamificationData}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Note: In production, points are awarded automatically when users receive likes on posts/comments.
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Community Leaderboard</h3>
          <Leaderboard communityId={communityId} period="30day" limit={10} />
        </div>
      </div>
    </div>
  );
};

export default GamificationTest;
