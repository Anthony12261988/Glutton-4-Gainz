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
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Look up invite by id first, then by token field
    let invite = null;
    let error = null;

    // Try by id (UUID format)
    const { data: inviteById, error: idError } = await supabaseAdmin
      .from("coach_invites")
      .select("id, email, status, created_at")
      .eq("id", token)
      .maybeSingle();

    if (!idError && inviteById) {
      invite = inviteById;
    } else {
      // Try by token column
      const { data: inviteByToken, error: tokenError } = await supabaseAdmin
        .from("coach_invites")
        .select("id, email, status, created_at")
        .eq("token", token)
        .maybeSingle();

      if (tokenError) {
        error = tokenError;
      } else {
        invite = inviteByToken;
      }
    }

    if (error) {
      console.error("[validate-invite] Error:", error);
      return NextResponse.json(
        { valid: false, error: "Failed to validate invite" },
        { status: 500 }
      );
    }

    if (!invite) {
      return NextResponse.json({ valid: false, error: "Invite not found" });
    }

    if (invite.status === "accepted") {
      return NextResponse.json({
        valid: false,
        expired: true,
        error: "Invite has already been accepted",
      });
    }

    // Check if invite is older than 7 days
    const createdAt = new Date(invite.created_at);
    const now = new Date();
    const daysDiff =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      return NextResponse.json({
        valid: false,
        expired: true,
        error: "Invite has expired",
      });
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      inviteId: invite.id,
    });
  } catch (error) {
    console.error("[validate-invite] Error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
