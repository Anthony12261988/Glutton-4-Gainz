import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRClient } from "./pr-client";

export default async function PersonalRecordsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user's personal records
  const { data: records } = await supabase
    .from("personal_records")
    .select("*")
    .eq("user_id", user.id)
    .order("achieved_at", { ascending: false });

  return (
    <div className="container mx-auto max-w-md px-4 py-6 md:max-w-4xl lg:max-w-7xl">
      <PRClient records={records || []} userId={user.id} />
    </div>
  );
}
