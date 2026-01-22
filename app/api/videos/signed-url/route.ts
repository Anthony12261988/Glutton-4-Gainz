import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_PREFIXES = ["intro/", "workouts/"];

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  if (path.startsWith("/") || path.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const isAllowed = ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (!isAllowed) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.storage
    .from("videos")
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: "Failed to create signed URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}
