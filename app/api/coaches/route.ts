import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");

  const userLat = latParam ? parseFloat(latParam) : null;
  const userLng = lngParam ? parseFloat(lngParam) : null;
  const radiusMiles = radiusParam ? parseFloat(radiusParam) : 50;

  if ((latParam && !lngParam) || (!latParam && lngParam)) {
    return NextResponse.json(
      { error: "Both lat and lng are required when filtering by location" },
      { status: 400 }
    );
  }

  if ((latParam && isNaN(userLat!)) || (lngParam && isNaN(userLng!))) {
    return NextResponse.json(
      { error: "Invalid location coordinates" },
      { status: 400 }
    );
  }

  if (radiusParam && (isNaN(radiusMiles) || radiusMiles <= 0 || radiusMiles > 500)) {
    return NextResponse.json(
      { error: "Invalid radius; must be a number between 1 and 500" },
      { status: 400 }
    );
  }

  const { data: coaches, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, email, bio, specialties, certifications, years_experience, avatar_url, location, latitude, longitude"
    )
    .eq("role", "coach")
    .eq("is_public", true);

  if (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }

  const results = (coaches ?? []).map((coach) => {
    let distanceMiles: number | null = null;
    if (
      userLat !== null &&
      userLng !== null &&
      coach.latitude !== null &&
      coach.longitude !== null
    ) {
      distanceMiles = haversineDistanceMiles(
        userLat,
        userLng,
        coach.latitude,
        coach.longitude
      );
    }

    return {
      id: coach.id,
      displayName: coach.email.split("@")[0],
      bio: coach.bio,
      specialties: coach.specialties,
      certifications: coach.certifications,
      years_experience: coach.years_experience,
      // avatar_url is stored as a full public URL from the public-files bucket
      avatar: coach.avatar_url ?? null,
      location: coach.location,
      latitude: coach.latitude,
      longitude: coach.longitude,
      distanceMiles,
    };
  });

  // Filter by radius if location was provided
  let filtered = results;
  if (userLat !== null && userLng !== null) {
    filtered = results
      .filter(
        (c) => c.distanceMiles !== null && c.distanceMiles <= radiusMiles
      )
      .sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));
  }

  return NextResponse.json(filtered);
}
