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
    const { token, userId, email } = await req.json();

    if (!token || !userId || !email) {
      return NextResponse.json(
        { success: false, error: "Token, userId, and email are required" },
        { status: 400 }
      );
    }

    // Find the invite - check both id and token columns
    let invite = null;
    let findError = null;

    // Try by id (UUID format)
    const { data: inviteById, error: idError } = await supabaseAdmin
      .from("coach_invites")
      .select("id, email, status")
      .eq("id", token)
      .maybeSingle();

    if (!idError && inviteById) {
      invite = inviteById;
    } else {
      // Try by token column
      const { data: inviteByToken, error: tokenError } = await supabaseAdmin
        .from("coach_invites")
        .select("id, email, status")
        .eq("token", token)
        .maybeSingle();

      if (tokenError) {
        findError = tokenError;
      } else {
        invite = inviteByToken;
      }
    }

    if (findError) {
      console.error("[accept-coach-invite] Find error:", findError);
      return NextResponse.json(
        { success: false, error: "Failed to find invite" },
        { status: 500 }
      );
    }

    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invite not found" },
        { status: 404 }
      );
    }

    if (invite.status === "accepted") {
      return NextResponse.json(
        { success: false, error: "Invite already accepted" },
        { status: 400 }
      );
    }

    // Verify email matches
    if (invite.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Email does not match invite" },
        { status: 403 }
      );
    }

    // Update invite status
    const { error: updateInviteError } = await supabaseAdmin
      .from("coach_invites")
      .update({ status: "accepted" })
      .eq("id", invite.id);

    if (updateInviteError) {
      console.error(
        "[accept-coach-invite] Update invite error:",
        updateInviteError
      );
      return NextResponse.json(
        { success: false, error: "Failed to update invite" },
        { status: 500 }
      );
    }

    // Update user role to coach
    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({ role: "coach" })
      .eq("id", userId);

    if (updateProfileError) {
      console.error(
        "[accept-coach-invite] Update profile error:",
        updateProfileError
      );
      // Try to rollback invite status
      await supabaseAdmin
        .from("coach_invites")
        .update({ status: "pending" })
        .eq("id", invite.id);

      return NextResponse.json(
        { success: false, error: "Failed to update user role" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[accept-coach-invite] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
