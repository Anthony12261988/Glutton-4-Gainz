import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import SpyModeProfile from "./spy-mode-profile";

export default async function SpyModePage({
  params,
}: {
  params: { userId: string };
}) {
  const cookieStore = await cookies();

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify coach
  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!coachProfile || coachProfile.role !== "coach") {
    redirect("/dashboard");
  }

  // Get soldier profile
  const { data: soldierProfile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.userId)
    .single();

  if (error || !soldierProfile) {
    notFound();
  }

  // Get soldier stats
  const { data: logs } = await supabase
    .from("user_logs")
    .select("*")
    .eq("user_id", params.userId)
    .order("date", { ascending: false })
    .limit(10);

  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", params.userId)
    .order("earned_at", { ascending: false });

  return (
    <SpyModeProfile
      soldier={soldierProfile}
      recentLogs={logs || []}
      badges={badges || []}
    />
  );
}
