import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FormationClient from "./formation-client";

export default async function FormationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <FormationClient user={user} profile={profile} />
    </div>
  );
}
