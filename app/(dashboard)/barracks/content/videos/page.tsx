import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VideoManagerClient } from "./video-manager-client";

export default async function VideoManagerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoachOrAdmin = profile?.role === "coach" || profile?.role === "admin";
  if (!isCoachOrAdmin) {
    redirect("/dashboard");
  }

  return <VideoManagerClient />;
}
