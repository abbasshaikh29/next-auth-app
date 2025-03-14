import { NextRequest, NextResponse } from "next/server";
import { dbconnect } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // TODO: Integrate with payment model
    const payments = [
      { date: "2025-03-01", amount: 100, status: "completed" },
      { date: "2025-02-28", amount: 150, status: "pending" },
    ];

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
