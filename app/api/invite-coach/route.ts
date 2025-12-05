import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email, invited_by } = await req.json();

    if (!email || !invited_by) {
      return NextResponse.json(
        { error: "Email and invited_by are required." },
        { status: 400 }
      );
    }

    // Check if email already exists in profiles
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("[invite-coach] Profile check error:", profileError);
    }

    if (existingProfile) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // Check if invite already exists
    const { data: existingInvite, error: inviteError } = await supabaseAdmin
      .from("coach_invites")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (inviteError) {
      console.error("[invite-coach] Invite check error:", inviteError);
      return NextResponse.json(
        { error: "Failed to check existing invites." },
        { status: 500 }
      );
    }

    if (existingInvite?.status === "accepted") {
      return NextResponse.json(
        { error: "This invite has already been accepted." },
        { status: 400 }
      );
    }

    // Create or reuse invite
    let inviteRecord = existingInvite;

    if (!inviteRecord) {
      const { data, error } = await supabaseAdmin
        .from("coach_invites")
        .insert({
          email,
          status: "pending",
          invited_by,
        })
        .select("*")
        .single();

      if (error) {
        console.error("[invite-coach] Insert error:", error);
        return NextResponse.json(
          { error: `Failed to create invite: ${error.message}` },
          { status: 500 }
        );
      }
      inviteRecord = data;
    }

    // Send email (only if Resend is configured)
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: true,
        invite: inviteRecord,
        warning: "Email not sent - RESEND_API_KEY not configured",
      });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const inviteToken = inviteRecord?.token ?? inviteRecord?.id;
    const acceptLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    const result = await resend.emails.send({
      from: "Glutton4Games Command <noreply@glutton4games.com>",
      to: email,
      subject: "CLASSIFIED: Officer Commission Offer",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; padding: 40px;">
          <h1 style="color: #dc2626; text-transform: uppercase; letter-spacing: 2px;">Officer Commission</h1>
          <p style="color: #9ca3af; line-height: 1.6;">
            You have been selected for a coach position at Glutton4Games Command.
          </p>
          <p style="color: #9ca3af; line-height: 1.6;">
            Click the button below to accept your commission and join the officer corps.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptLink}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; text-transform: uppercase; font-weight: bold; border-radius: 4px;">
              Accept Commission
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            This link will expire in 7 days. If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      `,
      text: `You have been drafted by Glutton4Games Command. Click here to accept your commission: ${acceptLink}`,
    });

    if (result.error) {
      console.error("[invite-coach] Email send error:", result.error);
    }

    return NextResponse.json({ success: true, invite: inviteRecord });
  } catch (error) {
    console.error("[invite-coach] Error:", error);
    return NextResponse.json(
      { error: "Failed to send invite." },
      { status: 500 }
    );
  }
}
