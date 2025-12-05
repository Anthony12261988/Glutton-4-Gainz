import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { userId, banned } = await req.json();

    if (!userId || typeof banned !== "boolean") {
      return NextResponse.json(
        { error: "userId and banned status are required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ banned })
      .eq("id", userId);

    if (error) {
      console.error("[ban-user] Error:", error);
      return NextResponse.json(
        { error: "Failed to update user status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ban-user] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
