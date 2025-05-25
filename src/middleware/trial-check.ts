import { NextRequest, NextResponse } from 'next/server';

// This function checks trial status via an API call instead of directly using mongoose
// This avoids Edge Runtime limitations with mongoose
export async function checkTrialStatus(
  req: NextRequest,
  userId: string,
  communitySlug: string
) {
  try {
    // Call our API endpoint to check trial status instead of using mongoose directly
    const response = await fetch(`${req.nextUrl.origin}/api/community/${communitySlug}/check-trial-status?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Error checking trial status via API:', response.status);
      // If API fails, allow access (fail open)
      return true;
    }
    
    const data = await response.json();
    return data.hasActiveTrialOrPayment;
  } catch (error) {
    console.error('Error checking trial status:', error);
    // In case of error, allow access (fail open)
    return true;
  }
}
