import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not remove this - it refreshes the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/dashboard");
  const isAuthCallback = pathname.startsWith("/auth/callback");

  // Skip auth callback
  if (isAuthCallback) {
    return supabaseResponse;
  }

  // Protect dashboard routes
  if (isAuthRoute && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users from home to dashboard
  if (pathname === "/" && user) {
    const hasAuditParam = request.nextUrl.searchParams.get("audit") === "true";
    const hasConfirmedParam = request.nextUrl.searchParams.get("confirmed") === "true";

    if (!hasAuditParam && !hasConfirmedParam) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match paths that need session refresh:
     * - / (home page)
     * - /dashboard (and sub-routes)
     * - /api (for authenticated API calls)
     */
    "/",
    "/dashboard/:path*",
    "/api/:path*",
  ],
};
