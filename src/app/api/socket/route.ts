import { NextRequest, NextResponse } from "next/server";

// This is a simple API route that will be used to test if the Socket.io server is running
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "Socket.io API route is working" });
}
