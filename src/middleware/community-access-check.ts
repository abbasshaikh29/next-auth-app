import { NextRequest, NextResponse } from 'next/server';
import { isCommunityActive } from '@/lib/trial-expiration-service';

/**
 * Check if a community is accessible (not suspended)
 * This function is called from middleware to block access to suspended communities
 */
export async function checkCommunityAccess(
  req: NextRequest,
  communitySlug: string
): Promise<{ allowed: boolean; reason?: string; redirectUrl?: string }> {
  try {
    // First, we need to get the community ID from the slug
    // We'll make an API call to avoid mongoose issues in Edge Runtime
    const response = await fetch(`${req.nextUrl.origin}/api/community/${communitySlug}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Error checking community status via API:', response.status);
      // If API fails, allow access (fail open) but log the error
      return { allowed: true };
    }
    
    const data = await response.json();
    
    // If community is suspended, block access
    if (data.suspended) {
      return {
        allowed: false,
        reason: data.suspensionReason || 'Community is suspended',
        redirectUrl: `/billing/${communitySlug}?suspended=true`
      };
    }
    
    // If community has no active trial or payment, redirect to billing
    if (!data.hasActiveTrialOrPayment) {
      return {
        allowed: false,
        reason: 'No active subscription or trial',
        redirectUrl: `/billing/${communitySlug}`
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking community access:', error);
    // In case of error, allow access (fail open) for better UX
    return { allowed: true };
  }
}

/**
 * Create a suspended community page response
 */
export function createSuspendedCommunityResponse(
  req: NextRequest,
  communitySlug: string,
  reason: string
): NextResponse {
  // Create a simple HTML page for suspended communities
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Community Suspended</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          text-align: center;
        }
        .icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        h1 {
          color: #dc3545;
          margin-bottom: 1rem;
        }
        p {
          color: #666;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .btn {
          display: inline-block;
          background-color: #007cba;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 0 10px;
        }
        .btn:hover {
          background-color: #005a8b;
        }
        .btn-secondary {
          background-color: #6c757d;
        }
        .btn-secondary:hover {
          background-color: #545b62;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🚫</div>
        <h1>Community Suspended</h1>
        <p>This community has been suspended due to: <strong>${reason}</strong></p>
        <p>The community admin needs to subscribe to reactivate access for all members.</p>
        <div>
          <a href="/billing/${communitySlug}" class="btn">Reactivate Community</a>
          <a href="/" class="btn btn-secondary">Go Home</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: 403,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
