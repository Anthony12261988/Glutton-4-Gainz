import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "coach") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Drop the old trigger
    await supabase.rpc("exec", {
      sql: "DROP TRIGGER IF EXISTS update_last_active_on_message ON messages",
    });

    // Create new function
    const functionSQL = `
      CREATE OR REPLACE FUNCTION update_last_active_on_message()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update sender's last_active
        UPDATE profiles
        SET last_active = NOW()
        WHERE id = NEW.sender_id;

        -- Update receiver's last_active
        UPDATE profiles
        SET last_active = NOW()
        WHERE id = NEW.receiver_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    await supabase.rpc("exec", { sql: functionSQL });

    // Create trigger
    const triggerSQL = `
      CREATE TRIGGER update_last_active_on_message
        AFTER INSERT ON messages
        FOR EACH ROW
        EXECUTE FUNCTION update_last_active_on_message();
    `;

    await supabase.rpc("exec", { sql: triggerSQL });

    return NextResponse.json({
      success: true,
      message: "Migration applied successfully",
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to apply migration" },
      { status: 500 }
    );
  }
}
