"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/Notification";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Calendar, TrendingUp, Users, UserPlus, AlertCircle } from "lucide-react";

interface AnalyticsData {
  period: string;
  activeMembers: number;
  newMembers: number;
  date: string;
}

interface AnalyticsSummary {
  currentActiveMembers: number;
  totalNewMembers: number;
  averageNewMembers: number;
  growthRate: number;
}

interface AnalyticsResponse {
  period: string;
  data: AnalyticsData[];
  summary: AnalyticsSummary;
}

type TimePeriod = "daily" | "weekly" | "monthly";

export default function AnalyticsDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("weekly");

  // Load saved period preference
  useEffect(() => {
    const savedPeriod = localStorage.getItem("analytics-period") as TimePeriod;
    if (savedPeriod && ["daily", "weekly", "monthly"].includes(savedPeriod)) {
      setSelectedPeriod(savedPeriod);
    }
  }, []);

  // Fetch analytics data
  const fetchAnalytics = async (period: TimePeriod) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await fetch(`/api/community/${slug}/analytics?period=${period}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      const data: AnalyticsResponse = await response.json();
      setAnalyticsData(data);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      const errorMessage = error.message || "Failed to load analytics";
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
    localStorage.setItem("analytics-period", period);
    fetchAnalytics(period);
  };

  // Calculate Y-axis domain to ensure it starts from zero
  const getYAxisDomain = (data: AnalyticsData[], dataKey: keyof AnalyticsData) => {
    if (!data || data.length === 0) return [0, 10];

    const maxValue = Math.max(...data.map(item => item[dataKey] as number));
    const padding = Math.max(1, Math.ceil(maxValue * 0.1)); // Add 10% padding

    return [0, maxValue + padding];
  };

  // Initial data fetch
  useEffect(() => {
    if (slug && session?.user?.id) {
      fetchAnalytics(selectedPeriod);
    }
  }, [slug, session?.user?.id, selectedPeriod]);

  // Format period label for display
  const formatPeriodLabel = (period: string, type: TimePeriod) => {
    try {
      switch (type) {
        case "daily":
          // Format: "2024-01-15 14:00" -> "2:00 PM"
          if (period.includes(' ')) {
            const [datePart, timePart] = period.split(' ');
            const [hour] = timePart.split(':');
            const hourNum = parseInt(hour);
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
            return `${displayHour}:00 ${ampm}`;
          }
          return new Date(period).toLocaleDateString();
        case "weekly":
        case "monthly":
          // Format: "2024-01-15" -> "Jan 15"
          const date = new Date(period + 'T00:00:00');
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          });
        default:
          return period;
      }
    } catch (error) {
      return period;
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium mb-2 text-gray-900">
            {formatPeriodLabel(label, selectedPeriod)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-700" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{Math.floor(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-base-content/70">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && !error && analyticsData && (
        <div className="p-6 space-y-8">
          {/* Active Members Chart */}
          <div className="bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Active members</h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value as TimePeriod)}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none cursor-pointer"
                >
                  <option value="daily">Daily active</option>
                  <option value="weekly">Weekly active</option>
                  <option value="monthly">Monthly active</option>
                </select>
              </div>
            </div>

            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatPeriodLabel(value, selectedPeriod)}
                    stroke="#666"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    domain={getYAxisDomain(analyticsData.data, 'activeMembers')}
                    allowDataOverflow={false}
                    includeHidden={false}
                    tickFormatter={(value) => Math.floor(value).toString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="activeMembers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Active Members"
                    dot={false}
                    activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Activity Heatmap */}
          <div className="bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Daily activity</h2>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => formatPeriodLabel(value, selectedPeriod)}
                    stroke="#666"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    domain={getYAxisDomain(analyticsData.data, 'newMembers')}
                    allowDataOverflow={false}
                    includeHidden={false}
                    tickFormatter={(value) => Math.floor(value).toString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="newMembers"
                    fill="#10b981"
                    name="New Members"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Members</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summary.currentActiveMembers}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Active Members</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summary.currentActiveMembers}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">New Members</div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.summary.totalNewMembers}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Growth Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {analyticsData.summary.growthRate > 0 ? "+" : ""}{Math.floor(analyticsData.summary.growthRate)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
