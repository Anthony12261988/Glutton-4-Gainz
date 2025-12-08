import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes (require authenticated session)
  const protectedRoutes = [
    "/dashboard",
    "/rations",
    "/barracks",
    "/profile",
    "/settings",
    "/stats",
  ];
  // Auth routes that signed-in users should NOT access (except onboarding)
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  // Onboarding is special - authenticated users CAN access it if they haven't completed it
  const isOnboarding = request.nextUrl.pathname.startsWith("/onboarding");

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!user && isProtectedRoute) {
    // Redirect to login if accessing protected route without user
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users from onboarding to signup
  if (!user && isOnboarding) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Signed-in users should not see auth pages (login, signup, etc.) - redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Coach and Admin only routes
  if (user && request.nextUrl.pathname.startsWith("/barracks")) {
    // We need to check the user's role.
    // Since we can't easily access the DB here without potentially slowing down every request,
    // we might rely on a custom claim or just let the page handle the authorization check
    // or do a quick DB check if performance allows.
    // For now, we'll let the page handle the specific role check or do it here if we fetch the profile.

    // Ideally, we should have role in metadata or fetch it.
    // Let's fetch the profile to check role for /barracks
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Allow both coaches and admins to access barracks
    if (profile?.role !== "coach" && profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard"; // Redirect non-coaches/non-admins to dashboard
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
