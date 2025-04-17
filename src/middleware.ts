import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware runs in the Edge Runtime and doesn't use any Node.js features

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check for auth cookie instead of using auth() function
  const authCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  // User is authenticated if they have the auth cookie
  const isAuthenticated = !!authCookie;

  // Protected routes that require authentication
  const protectedPaths = [
    "/profile",
    "/UserSettings",
    "/communityform",
    "/Newcompage",
  ];

  const path = request.nextUrl.pathname;

  // Check if the path is protected and user is not authenticated
  const isProtectedPath = protectedPaths.some(
    (protectedPath) =>
      path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login page if trying to access protected route without authentication
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(redirectUrl);
  }

  // If user is already logged in and tries to access login/register pages
  if (isAuthenticated && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/profile/:path*",
    "/UserSettings/:path*",
    "/communityform/:path*",
    "/Newcompage/:path*",
    "/login",
    "/register",
  ],
};
