import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Fast cookie-based auth check - no network call
  // Supabase stores auth in cookies with pattern: sb-<project-ref>-auth-token
  const authCookies = Array.from(request.cookies.getAll()).filter(
    cookie => cookie.name.includes('auth-token') || cookie.name.includes('sb-')
  );

  const hasAuthCookie = authCookies.length > 0 && authCookies.some(c => c.value.length > 10);

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/dashboard");
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isApiRoute = pathname.startsWith("/api");

  // Skip API routes and callback
  if (isAuthCallback || isApiRoute) {
    return NextResponse.next();
  }

  // Protect dashboard routes - instant redirect if no auth cookie
  if (isAuthRoute && !hasAuthCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users from home to dashboard
  if (pathname === "/" && hasAuthCookie) {
    const hasAuditParam = request.nextUrl.searchParams.get("audit") === "true";
    const hasConfirmedParam = request.nextUrl.searchParams.get("confirmed") === "true";

    if (!hasAuditParam && !hasConfirmedParam) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match only specific paths for faster middleware:
     * - / (home page)
     * - /dashboard (and sub-routes)
     */
    "/",
    "/dashboard/:path*",
  ],
};
