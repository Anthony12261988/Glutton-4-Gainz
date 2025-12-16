import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import webpush from "web-push";

// Configure web-push with VAPID keys (must be set in env)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@glutton4gainz.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: Request) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Push is not configured on the server" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // rely on RLS + session instead of service role
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  try {
    const body = await request.json();
    const { userId, title, body: notificationBody, icon, badge, data } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow sending to the authenticated user (prevents cross-user abuse from client)
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: subscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", targetUserId)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "No push subscription found for user" },
        { status: 404 }
      );
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key,
      },
    };

    const payload = JSON.stringify({
      title,
      body: notificationBody || "",
      icon: icon || "/icons/icon-192x192.png",
      badge: badge || "/icons/icon-96x96.png",
      data: data || {},
    });

    await webpush.sendNotification(pushSubscription, payload);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error sending push notification:", err);

    if (err.statusCode === 410) {
      // Subscription is gone/expired; clean it up to avoid repeated failures
      const cookieStore = await cookies();
      const supabaseCleanup = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: "", ...options });
            },
          },
        }
      );
      const {
        data: { user },
      } = await supabaseCleanup.auth.getUser();
      if (user) {
        await supabaseCleanup.from("push_subscriptions").delete().eq("user_id", user.id);
      }
      return NextResponse.json(
        { error: "Push subscription expired" },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to send push notification" },
      { status: 500 }
    );
  }
}
