import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ZeroDayClient from "./zero-day-client";

export default async function ZeroDayPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Admins and coaches don't need Zero Day
  if (profile.role === "admin" || profile.role === "coach") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <ZeroDayClient userId={user.id} currentTier={profile.tier} />
    </div>
  );
}



