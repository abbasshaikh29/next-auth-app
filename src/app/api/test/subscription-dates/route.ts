import { NextRequest, NextResponse } from "next/server";
import { 
  validateAndConvertTimestamp, 
  isValidSubscriptionDate, 
  getSafeSubscriptionDates,
  formatSubscriptionDate 
} from "@/lib/subscription-date-utils";

// GET /api/test/subscription-dates - Test subscription date handling
export async function GET(request: NextRequest) {
  try {
    // Test cases for different timestamp scenarios
    const testCases = [
      {
        name: "Valid timestamp",
        timestamp: Math.floor(Date.now() / 1000), // Current time in seconds
        expected: "valid"
      },
      {
        name: "Zero timestamp",
        timestamp: 0,
        expected: "invalid - should use fallback"
      },
      {
        name: "Null timestamp",
        timestamp: null,
        expected: "invalid - should use fallback"
      },
      {
        name: "Undefined timestamp",
        timestamp: undefined,
        expected: "invalid - should use fallback"
      },
      {
        name: "Unix epoch timestamp",
        timestamp: 0,
        expected: "invalid - should use fallback"
      },
      {
        name: "Future timestamp",
        timestamp: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000), // 30 days from now
        expected: "valid"
      }
    ];

    const results = [];
    const fallbackDate = new Date();

    for (const testCase of testCases) {
      const result = validateAndConvertTimestamp(
        testCase.timestamp as any,
        fallbackDate,
        `test-${testCase.name}`
      );

      const isValid = isValidSubscriptionDate(result);
      const formatted = formatSubscriptionDate(result.toISOString());

      results.push({
        testCase: testCase.name,
        input: testCase.timestamp,
        output: result.toISOString(),
        isValid,
        formatted,
        expected: testCase.expected,
        passed: testCase.expected.includes("invalid") ? !isValid || result.getTime() === fallbackDate.getTime() : isValid
      });
    }

    // Test getSafeSubscriptionDates with mock Razorpay data
    const mockRazorpayData = {
      current_start: 0, // Invalid timestamp
      current_end: null, // Invalid timestamp
      charge_at: Math.floor(Date.now() / 1000), // Valid timestamp
      start_at: undefined,
      end_at: Math.floor((Date.now() + 60 * 24 * 60 * 60 * 1000) / 1000) // Valid future timestamp
    };

    const mockPlan = {
      trialPeriodDays: 14
    };

    const safeSubscriptionDates = getSafeSubscriptionDates(mockRazorpayData, mockPlan);

    return NextResponse.json({
      success: true,
      message: "Subscription date handling test completed",
      testResults: results,
      safeSubscriptionDatesTest: {
        input: mockRazorpayData,
        output: {
          currentStart: safeSubscriptionDates.currentStart.toISOString(),
          currentEnd: safeSubscriptionDates.currentEnd.toISOString(),
          chargeAt: safeSubscriptionDates.chargeAt.toISOString(),
          startAt: safeSubscriptionDates.startAt?.toISOString(),
          endAt: safeSubscriptionDates.endAt?.toISOString()
        },
        validation: {
          currentStartValid: isValidSubscriptionDate(safeSubscriptionDates.currentStart),
          currentEndValid: isValidSubscriptionDate(safeSubscriptionDates.currentEnd),
          chargeAtValid: isValidSubscriptionDate(safeSubscriptionDates.chargeAt)
        }
      },
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      }
    });

  } catch (error: any) {
    console.error("Error in subscription date test:", error);
    return NextResponse.json(
      { error: error.message || "Test failed" },
      { status: 500 }
    );
  }
}
