import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";
import { Community } from "@/models/Community";
import { User } from "@/models/User";
import { getServerSession } from "@/lib/auth-helpers";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await context.params;
    const { slug } = resolvedParams;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "weekly"; // daily, weekly, monthly

    await dbconnect();

    // Find the community
    const community = await Community.findOne({ slug });
    if (!community) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or sub-admin
    const userId = session.user.id;
    const isAdmin = community.admin === userId;
    const isSubAdmin = community.subAdmins?.includes(userId) || false;

    if (!isAdmin && !isSubAdmin) {
      return NextResponse.json(
        { error: "Access denied. Admin or Sub-admin privileges required." },
        { status: 403 }
      );
    }

    // Get current date and calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let groupBy: any;

    switch (period) {
      case "daily":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        dateFormat = "%Y-%m-%d %H:00";
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d %H:00",
            date: "$createdAt"
          }
        };
        break;
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        dateFormat = "%Y-%m-%d";
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        };
        break;
      case "monthly":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        dateFormat = "%Y-%m-%d";
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        };
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFormat = "%Y-%m-%d";
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt"
          }
        };
    }

    // Convert member IDs to ObjectIds for aggregation
    const memberObjectIds = community.members.map((id: string) =>
      new mongoose.Types.ObjectId(id)
    );

    // Get member join data aggregated by time period
    const memberJoinData = await User.aggregate([
      {
        $match: {
          _id: { $in: memberObjectIds },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          newMembers: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate active members (cumulative count over time)
    const totalMembers = community.members.length;
    let cumulativeNewMembers = 0;

    const activeMembersData = memberJoinData.map((item) => {
      cumulativeNewMembers += item.newMembers;

      return {
        period: item._id,
        activeMembers: totalMembers, // Current total active members
        newMembers: item.newMembers,
        date: item._id
      };
    });

    // Fill in missing periods with zero values
    const filledData = fillMissingPeriods(activeMembersData, period, startDate, now, totalMembers);

    // If no data exists, generate sample data for demonstration
    if (filledData.length === 0) {
      const sampleData = generateSampleData(period, startDate, now, totalMembers);
      filledData.push(...sampleData);
    }

    // Calculate summary statistics
    const currentActiveMembers = totalMembers;
    const totalNewMembers = memberJoinData.reduce((sum, item) => sum + item.newMembers, 0);
    const averageNewMembers = totalNewMembers / (filledData.length || 1);

    // Calculate growth rate
    const previousPeriodMembers = filledData.length > 1 ? filledData[filledData.length - 2]?.activeMembers || 0 : 0;
    const growthRate = previousPeriodMembers > 0 
      ? ((currentActiveMembers - previousPeriodMembers) / previousPeriodMembers) * 100 
      : 0;

    return NextResponse.json({
      period,
      data: filledData,
      summary: {
        currentActiveMembers,
        totalNewMembers,
        averageNewMembers: Math.round(averageNewMembers * 100) / 100,
        growthRate: Math.round(growthRate * 100) / 100
      }
    });

  } catch (error) {
    console.error("Error fetching community analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

// Helper function to fill missing periods with zero values
function fillMissingPeriods(data: any[], period: string, startDate: Date, endDate: Date, totalMembers: number) {
  const filledData = [];
  const dataMap = new Map(data.map(item => [item.period, item]));
  
  const current = new Date(startDate);
  
  while (current <= endDate) {
    let periodKey: string;

    switch (period) {
      case "daily":
        // Format as YYYY-MM-DD HH:00 for hourly data
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')} ${current.getHours().toString().padStart(2, '0')}:00`;
        break;
      case "weekly":
      case "monthly":
        // Format as YYYY-MM-DD for daily data
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
        break;
      default:
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
    }
    
    if (dataMap.has(periodKey)) {
      filledData.push(dataMap.get(periodKey));
    } else {
      filledData.push({
        period: periodKey,
        activeMembers: totalMembers, // Use current total members for missing periods
        newMembers: 0,
        date: periodKey
      });
    }
    
    // Increment current date based on period
    switch (period) {
      case "daily":
        current.setHours(current.getHours() + 1); // Increment by hour
        break;
      case "weekly":
      case "monthly":
        current.setDate(current.getDate() + 1); // Increment by day
        break;
    }
  }
  
  return filledData;
}

// Helper function to generate sample data when no real data exists
function generateSampleData(period: string, startDate: Date, endDate: Date, totalMembers: number) {
  const sampleData = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    let periodKey: string;

    switch (period) {
      case "daily":
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')} ${current.getHours().toString().padStart(2, '0')}:00`;
        current.setHours(current.getHours() + 1);
        break;
      case "weekly":
      case "monthly":
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
        current.setDate(current.getDate() + 1);
        break;
      default:
        periodKey = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
        current.setDate(current.getDate() + 1);
    }

    // Generate some sample data with random variations
    const newMembers = Math.floor(Math.random() * 3); // 0-2 new members per period

    sampleData.push({
      period: periodKey,
      activeMembers: totalMembers,
      newMembers,
      date: periodKey
    });
  }

  return sampleData;
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
