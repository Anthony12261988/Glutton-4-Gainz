import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY configuration." },
      { status: 500 }
    );
  }

  try {
    const { email, invite_token } = await req.json();

    if (!email || !invite_token) {
      return NextResponse.json(
        { error: "Email and invite_token are required." },
        { status: 400 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    const acceptLink = `${appUrl}/onboarding?invite=${invite_token}`;

    await resend.emails.send({
      from: "Glutton4Games Command <noreply@glutton4games.com>",
      to: email,
      subject: "CLASSIFIED: Officer Commission Offer",
      text: `You have been drafted by Glutton4Games Command. Click here to accept your commission: ${acceptLink}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending coach invite:", error);
    return NextResponse.json(
      { error: "Failed to send invite." },
      { status: 500 }
    );
  }
}
