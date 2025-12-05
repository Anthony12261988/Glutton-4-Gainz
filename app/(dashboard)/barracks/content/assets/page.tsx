import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssetManagerClient } from "./asset-manager-client";

export default async function AssetManagerPage() {
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

  if (profile?.role !== "coach") {
    redirect("/dashboard");
  }

  return <AssetManagerClient />;
}
