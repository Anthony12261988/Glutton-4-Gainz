import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const inviteToken = searchParams.get("invite");

  // Default redirect
  let next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData.user) {
      // If there's an invite token, accept it
      if (inviteToken) {
        try {
          const acceptResponse = await fetch(
            `${origin}/api/accept-coach-invite`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: inviteToken,
                userId: sessionData.user.id,
                email: sessionData.user.email,
              }),
            }
          );

          const acceptResult = await acceptResponse.json();

          if (acceptResult.success) {
            next = "/barracks";
          } else {
            console.error(
              "[Auth Callback] Failed to accept invite:",
              acceptResult.error
            );
            next = "/onboarding?error=invite_failed";
          }
        } catch (err) {
          console.error("[Auth Callback] Error accepting invite:", err);
          next = "/onboarding?error=invite_error";
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
