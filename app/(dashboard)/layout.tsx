import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isCoach = profile?.role === "coach";
  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar isCoach={isCoach} isAdmin={isAdmin} />

      {/* Main Content Area */}
      <div className="md:pl-64">
        {/* Content with proper responsive padding */}
        <main className="relative min-h-screen pb-20 md:pb-6">
          {/* Watermark Background */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div 
              className="absolute inset-0 z-[1] opacity-[0.15] bg-repeat-y bg-top bg-contain"
              style={{
                backgroundImage: 'url(/branding/IMG_5618.PNG)',
              }}
            />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav isCoach={isCoach} isAdmin={isAdmin} />
    </div>
  );
}
