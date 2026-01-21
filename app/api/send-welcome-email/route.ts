import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Only send if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("Welcome email failed - RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const result = await resend.emails.send({
      from: "Glutton4Gainz Command <noreply@glutton4gainz.com>",
      to: email,
      subject: "WELCOME TO THE GRIND, RECRUIT",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; text-transform: uppercase; letter-spacing: 3px; font-size: 28px; margin: 0;">
              WELCOME TO GLUTTON4GAINZ
            </h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px;">
              YOUR MISSION STARTS NOW
            </p>
          </div>

          <div style="background-color: #1a1a1a; border: 1px solid #dc2626; padding: 30px; margin: 30px 0;">
            <p style="color: #ffffff; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
              Recruit,
            </p>
            <p style="color: #9ca3af; line-height: 1.8; font-size: 14px; margin: 0 0 15px 0;">
              You've been enlisted. This isn't a gym membership—it's a commitment to tactical fitness excellence.
            </p>
            <p style="color: #9ca3af; line-height: 1.8; font-size: 14px; margin: 0 0 15px 0;">
              <strong style="color: #dc2626;">Your first mission:</strong> Complete the Zero-Day Assessment to establish your tier and unlock your training protocols.
            </p>
            <p style="color: #9ca3af; line-height: 1.8; font-size: 14px; margin: 0;">
              Daily missions drop at 0500 hours. No excuses. No negotiations. Just execution.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/onboarding" style="background-color: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; text-transform: uppercase; font-weight: bold; border-radius: 4px; display: inline-block; letter-spacing: 1px;">
              BEGIN ZERO-DAY ASSESSMENT
            </a>
          </div>

          <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
              <strong>What's Next:</strong>
            </p>
            <ul style="color: #6b7280; font-size: 12px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Complete your Zero-Day Assessment</li>
              <li>Establish your tier (.223, .556, .762, or .50 Cal)</li>
              <li>Start executing daily missions</li>
              <li>Build your streak and earn badges</li>
            </ul>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
            <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 0;">
              DISCIPLINE. STRENGTH. HONOR.
            </p>
            <p style="color: #4b5563; font-size: 11px; text-align: center; margin: 5px 0 0 0;">
              Glutton4Gainz Command © 2024
            </p>
          </div>
        </div>
      `,
      text: `WELCOME TO GLUTTON4GAINZ

Recruit,

You've been enlisted. This isn't a gym membership—it's a commitment to tactical fitness excellence.

Your first mission: Complete the Zero-Day Assessment to establish your tier and unlock your training protocols.

Daily missions drop at 0500 hours. No excuses. No negotiations. Just execution.

Begin your Zero-Day Assessment: ${appUrl}/onboarding

DISCIPLINE. STRENGTH. HONOR.
Glutton4Gainz Command © 2024`,
    });

    if (result.error) {
      console.error("[send-welcome-email] Email send error:", result.error);
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-welcome-email] Error:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
