import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Use environment variable for secret
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Log the request for debugging
  console.log(`Middleware processing request for: ${pathname}`);

  // First try to get token using getToken
  let token;
  try {
    token = await getToken({
      req,
      secret: NEXTAUTH_SECRET,
    });

    if (token) {
      console.log("Token found, user is authenticated");
    }
  } catch (error) {
    console.error("Error getting token:", error);
    token = null;
  }

  // If token method fails, check for cookies directly
  if (!token) {
    // Log all cookies for debugging
    const allCookies = Array.from(req.cookies.getAll());
    console.log(
      "All cookies in middleware:",
      allCookies.map((c) => c.name)
    );

    // Check for any auth-related cookie
    const authCookie =
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token") ||
      req.cookies.get("__Host-next-auth.session-token");

    // Also check for callback URL cookie which might indicate an ongoing auth flow
    const callbackCookie = req.cookies.get("next-auth.callback-url");

    // Check for CSRF token which might indicate a valid session
    const csrfCookie = req.cookies.get("next-auth.csrf-token");

    if (authCookie) {
      console.log("Found auth cookie, allowing access");
      return NextResponse.next();
    }

    if (callbackCookie) {
      console.log("Found callback cookie, auth flow in progress");
      // Allow access during auth flow
      return NextResponse.next();
    }

    if (csrfCookie) {
      console.log("Found CSRF cookie, possible valid session");
      // If we have a CSRF token, the user might be in an auth flow
      return NextResponse.next();
    }

    // If we have any cookies at all, be more permissive in production
    if (process.env.NODE_ENV === "production" && allCookies.length > 0) {
      console.log("Production environment with cookies, allowing access");
      return NextResponse.next();
    }
  }

  // Allow all URLs if the user is logged in or if it's a public route
  if (token) {
    return NextResponse.next();
  }

  // Allow specific public routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/" ||
    pathname.startsWith("/api/community") ||
    pathname === "/api/community/posts" ||
    pathname === "/auth-test" ||
    pathname === "/auth-debug" ||
    pathname.startsWith("/api/debug")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and not a public route
  console.log("Redirecting to login from path:", pathname);
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
