import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log("Auth callback received, code:", code ? "present" : "missing");

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Échanger le code contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("Exchange result:", { user: data?.user?.email, error: error?.message });

    if (!error && data?.session) {
      // Session établie avec succès, rediriger vers le dashboard
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    }
  }

  // En cas d'erreur, rediriger vers l'accueil avec le modal de connexion
  return NextResponse.redirect(new URL("/?confirmed=true", requestUrl.origin));
}
