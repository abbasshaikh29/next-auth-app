import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Use environment variable for secret
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  // First try to get token using getToken
  let token;
  try {
    token = await getToken({
      req,
      secret: NEXTAUTH_SECRET,
    });
  } catch (error) {
    console.error("Error getting token:", error);
    token = null;
  }

  // If token method fails, check for cookies directly
  if (!token) {
    const authCookie =
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token") ||
      req.cookies.get("__Host-next-auth.session-token");

    if (authCookie) {
      console.log("Found auth cookie, allowing access");
      return NextResponse.next();
    }
  }

  const { pathname } = req.nextUrl;

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
    pathname === "/api/community/posts"
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
