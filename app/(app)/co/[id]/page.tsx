import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ArrowLeft,
  Shield,
  MapPin,
  Clock,
  Award,
  FileText,
} from "lucide-react";
import { RequestBriefingButton } from "./request-briefing-button";

interface COProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: COProfilePageProps) {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("email, bio")
    .eq("id", id)
    .eq("role", "coach")
    .eq("is_public", true)
    .single();

  if (!data) return { title: "CO Not Found | Glutton4Gainz" };

  return {
    title: `CO ${data.email.split("@")[0]} | Glutton4Gainz`,
    description: data.bio ?? "Commanding Officer profile on Glutton4Gainz",
  };
}

export default async function COProfilePage({ params }: COProfilePageProps) {
  const { id } = await params;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, email, bio, specialties, certifications, years_experience, avatar_url, location"
    )
    .eq("id", id)
    .eq("role", "coach")
    .eq("is_public", true)
    .single();

  if (error || !profile) {
    notFound();
  }

  // avatar_url is stored as a full public URL from the public-files bucket
  const signedAvatar = profile.avatar_url ?? null;

  const specialties = profile.specialties
    ? profile.specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const certifications = profile.certifications
    ? profile.certifications.split(",").map((c: string) => c.trim()).filter(Boolean)
    : [];

  const displayName = profile.email.split("@")[0];

  return (
    <div className="min-h-screen bg-camo-black">
      {/* Back nav */}
      <div className="border-b border-steel bg-gunmetal px-4 py-3 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/find-your-co"
            className="inline-flex items-center gap-2 text-sm text-steel hover:text-high-vis transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Find Your CO
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 space-y-6">
        {/* Profile header */}
        <div className="rounded-sm border border-steel/30 bg-gunmetal p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative h-24 w-24 shrink-0 rounded-sm overflow-hidden border-2 border-tactical-red/40">
              {signedAvatar ? (
                <Image
                  src={signedAvatar}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-steel/20">
                  <Shield className="h-10 w-10 text-steel" />
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded bg-tactical-red/20 px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wider text-tactical-red">
                  CO
                </span>
              </div>
              <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
                {displayName}
              </h1>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-text">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-tactical-red" />
                    {profile.location}
                  </span>
                )}
                {profile.years_experience && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-tactical-red" />
                    {profile.years_experience} years in the field
                  </span>
                )}
              </div>
            </div>

            {/* Action button — client component handles auth check */}
            <RequestBriefingButton coachId={profile.id} />
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="rounded-sm border border-steel/30 bg-gunmetal p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-muted-text mb-3">
              Mission Statement
            </h2>
            <p className="text-sm text-high-vis leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="rounded-sm border border-steel/30 bg-gunmetal p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-muted-text mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-tactical-red" />
              Specialties
            </h2>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s: string) => (
                <span
                  key={s}
                  className="rounded-sm border border-tactical-red/30 bg-tactical-red/10 px-3 py-1 text-xs font-heading font-bold uppercase tracking-wide text-tactical-red"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="rounded-sm border border-steel/30 bg-gunmetal p-6">
            <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-muted-text mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-tactical-red" />
              Certifications
            </h2>
            <ul className="space-y-2">
              {certifications.map((cert: string) => (
                <li
                  key={cert}
                  className="flex items-center gap-2 text-sm text-high-vis"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-tactical-red shrink-0" />
                  {cert}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
