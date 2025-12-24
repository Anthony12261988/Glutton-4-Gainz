import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChallengesClient from "./challenges-client";
import { getActiveChallenges } from "@/lib/queries/challenges";

export default async function ChallengesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: challenges } = await getActiveChallenges();

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <ChallengesClient challenges={challenges || []} userId={user.id} />
    </div>
  );
}
