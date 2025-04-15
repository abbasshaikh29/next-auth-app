import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Hardcoded secret from .env file for middleware
const NEXTAUTH_SECRET =
  "a9b7c5d3e1f02468ace0987654321fedcba8901234567890abcdef12345678";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: NEXTAUTH_SECRET,
  });
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
