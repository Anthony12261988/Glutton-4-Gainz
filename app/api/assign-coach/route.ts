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
    const { userId, coachId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify the coach exists and has coach role (if coachId is provided)
    if (coachId) {
      const { data: coach, error: coachError } = await supabaseAdmin
        .from("profiles")
        .select("id, role")
        .eq("id", coachId)
        .single();

      if (coachError || !coach) {
        return NextResponse.json({ error: "Coach not found" }, { status: 404 });
      }

      if (coach.role !== "coach" && coach.role !== "admin") {
        return NextResponse.json(
          { error: "Selected user is not a coach" },
          { status: 400 }
        );
      }
    }

    // Update the user's coach_id
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ coach_id: coachId || null })
      .eq("id", userId);

    if (updateError) {
      console.error("[assign-coach] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to assign coach" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: coachId
        ? "Coach assigned successfully"
        : "Coach unassigned successfully",
    });
  } catch (error) {
    console.error("[assign-coach] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
