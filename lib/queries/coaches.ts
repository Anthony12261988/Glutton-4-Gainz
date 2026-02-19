import { supabaseAdmin } from "@/lib/supabase/admin";

export interface CoachProfile {
  id: string;
  displayName: string;
  bio: string | null;
  specialties: string | null;
  certifications: string | null;
  years_experience: number | null;
  /** Signed avatar URL (1h expiry), or null */
  avatar: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function getPublicCoaches(): Promise<CoachProfile[]> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, email, bio, specialties, certifications, years_experience, avatar_url, location, latitude, longitude"
    )
    .eq("role", "coach")
    .eq("is_public", true);

  if (error) {
    console.error("Error fetching public coaches:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.email.split("@")[0],
    bio: row.bio,
    specialties: row.specialties,
    certifications: row.certifications,
    years_experience: row.years_experience,
    // avatar_url is stored as a full public URL from the public-files bucket
    avatar: row.avatar_url ?? null,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
  }));
}
