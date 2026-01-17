import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session - fast check
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");

  // Skip callback route
  if (isAuthCallback) {
    return response;
  }

  // Protect dashboard routes - redirect to home if not authenticated
  if (isAuthRoute && !session) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from home to dashboard (only if no special params)
  if (request.nextUrl.pathname === "/" && session) {
    const hasAuditParam = request.nextUrl.searchParams.get("audit") === "true";
    const hasConfirmedParam = request.nextUrl.searchParams.get("confirmed") === "true";

    // Don't redirect if user wants to do audit or just confirmed email
    if (!hasAuditParam && !hasConfirmedParam) {
      const redirectUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
