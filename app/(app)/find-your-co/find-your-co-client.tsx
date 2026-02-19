"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Navigation,
  Users,
  Award,
  Clock,
  ChevronDown,
  Loader2,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CoachProfile } from "@/lib/queries/coaches";
import { useUser } from "@/hooks/use-user";

// Dynamically import the map to avoid SSR issues
const CoachMap = dynamic(() => import("./coach-map"), { ssr: false });

interface CoachWithDistance extends CoachProfile {
  distanceMiles?: number | null;
}

interface FindYourCOClientProps {
  initialCoaches: CoachProfile[];
}

const RADIUS_OPTIONS = [
  { label: "10 mi", value: 10 },
  { label: "25 mi", value: 25 },
  { label: "50 mi", value: 50 },
  { label: "100 mi", value: 100 },
  { label: "200 mi", value: 200 },
];

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "User-Agent": "Glutton4Gainz/1.0" } }
    );
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // silently fail
  }
  return null;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "Glutton4Gainz/1.0" } }
    );
    const data = await res.json();
    const addr = data?.address;
    if (addr) {
      const city = addr.city || addr.town || addr.village || addr.county || "";
      const state = addr.state || "";
      return [city, state].filter(Boolean).join(", ");
    }
  } catch {
    // silently fail
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function FindYourCOClient({ initialCoaches }: FindYourCOClientProps) {
  const { user, loading: userLoading } = useUser();
  const [coaches, setCoaches] = useState<CoachWithDistance[]>(initialCoaches);
  const [filteredCoaches, setFilteredCoaches] =
    useState<CoachWithDistance[]>(initialCoaches);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [radius, setRadius] = useState(50);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Collect all unique specialties for the filter dropdown
  const allSpecialties = Array.from(
    new Set(
      coaches
        .flatMap((c) =>
          c.specialties
            ? c.specialties.split(",").map((s) => s.trim()).filter(Boolean)
            : []
        )
    )
  ).sort();

  // Client-side filtering (name + specialty)
  useEffect(() => {
    let result = coaches;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.displayName.toLowerCase().includes(q));
    }
    if (specialtyFilter) {
      result = result.filter(
        (c) => c.specialties?.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }
    setFilteredCoaches(result);
  }, [searchQuery, specialtyFilter, coaches]);

  const fetchCoachesWithLocation = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/coaches?lat=${lat}&lng=${lng}&radius=${radius}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data: CoachWithDistance[] = await res.json();
        setCoaches(data);
      } catch {
        setLocationError("Failed to load COs. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [radius]
  );

  const handleScanAO = async () => {
    if (!locationInput.trim()) return;
    setLocationError(null);
    setLoading(true);
    const coords = await geocodeAddress(locationInput);
    if (!coords) {
      setLocationError("AO not found. Try a different city or zip code.");
      setLoading(false);
      return;
    }
    setUserLocation(coords);
    await fetchCoachesWithLocation(coords.lat, coords.lng);
  };

  const handlePingPosition = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported on this device.");
      return;
    }
    setLocationError(null);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        const placeName = await reverseGeocode(coords.lat, coords.lng);
        setLocationInput(placeName);
        await fetchCoachesWithLocation(coords.lat, coords.lng);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            "Position access denied. Enable location permissions and retry."
          );
        } else if (err.code === err.TIMEOUT) {
          setLocationError("Position ping timed out. Try again.");
        } else {
          setLocationError("Unable to determine your position.");
        }
      },
      { timeout: 10000 }
    );
  };

  const handleMarkerClick = useCallback((id: string) => {
    setHighlightedId(id);
    const el = cardRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-camo-black">
      {/* Header */}
      <div className="border-b border-steel bg-gunmetal px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="rounded-sm bg-tactical-red p-2">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold uppercase tracking-wider text-high-vis">
              Find Your CO
            </h1>
          </div>
          <p className="text-sm text-muted-text ml-14">
            Commanding Officers ready to deploy — find yours and request a
            briefing.
          </p>
        </div>
      </div>

      {!userLoading && !user && (
        <div className="border-b border-steel bg-gunmetal/40 px-4 py-3 md:px-8">
          <div className="mx-auto max-w-7xl rounded-sm border border-tactical-red/40 bg-tactical-red/10 px-4 py-3">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-high-vis">
              Visitor Access: Profiles are public. Briefing requests require authentication.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Link
                href="/login?redirect=/find-your-co"
                className="rounded-sm border border-tactical-red/40 px-3 py-1.5 font-heading font-bold uppercase tracking-wide text-tactical-red hover:bg-tactical-red/20"
              >
                Enter HQ
              </Link>
              <Link
                href="/signup?redirect=/find-your-co"
                className="rounded-sm bg-tactical-red px-3 py-1.5 font-heading font-bold uppercase tracking-wide text-white hover:bg-red-700"
              >
                Enlist Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search controls */}
      <div className="border-b border-steel bg-gunmetal/50 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-7xl space-y-3">
          {/* Row 1: name + specialty */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by CO name..."
                className="bg-gunmetal border-steel/40 pl-9 text-high-vis placeholder:text-steel"
              />
            </div>

            {allSpecialties.length > 0 && (
              <div className="relative">
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="appearance-none bg-gunmetal border border-steel/40 rounded-sm px-3 py-2 pr-8 text-sm text-high-vis focus:outline-none focus:border-tactical-red w-full sm:w-48"
                >
                  <option value="">All Specialties</option>
                  {allSpecialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              </div>
            )}

            {/* Radius */}
            <div className="relative">
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="appearance-none bg-gunmetal border border-steel/40 rounded-sm px-3 py-2 pr-8 text-sm text-high-vis focus:outline-none focus:border-tactical-red w-full sm:w-32"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
            </div>
          </div>

          {/* Row 2: AO search */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanAO()}
                placeholder="Enter your AO (city, state, or zip)..."
                className="bg-gunmetal border-steel/40 pl-9 text-high-vis placeholder:text-steel"
              />
            </div>
            <Button
              onClick={handleScanAO}
              disabled={loading || !locationInput.trim()}
              className="bg-tactical-red hover:bg-red-700 font-heading font-bold uppercase tracking-wide"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Scan AO"
              )}
            </Button>
            <Button
              onClick={handlePingPosition}
              disabled={loading}
              variant="outline"
              className="border-steel/40 text-muted-text hover:border-tactical-red hover:text-tactical-red font-heading font-bold uppercase tracking-wide"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Ping My Position
            </Button>
          </div>

          {locationError && (
            <div className="flex items-center gap-2 rounded-sm border border-tactical-red/40 bg-tactical-red/10 px-3 py-2 text-sm text-tactical-red">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {locationError}
            </div>
          )}
        </div>
      </div>

      {/* Main content: cards + map */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* CO cards — left column */}
          <div className="w-full lg:w-[420px] shrink-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-text">
              {filteredCoaches.length === 0
                ? "No COs in this AO"
                : `${filteredCoaches.length} CO${filteredCoaches.length !== 1 ? "s" : ""} found`}
            </p>

            {filteredCoaches.length === 0 ? (
              <div className="rounded-sm border border-steel/30 bg-gunmetal p-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-steel" />
                <p className="font-heading font-bold uppercase tracking-wide text-muted-text">
                  No COs available in this AO
                </p>
                <p className="mt-1 text-xs text-steel">
                  Try expanding your radius or clearing filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {filteredCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    ref={(el) => {
                      cardRefs.current[coach.id] = el;
                    }}
                    className={`rounded-sm border bg-gunmetal p-4 transition-all cursor-pointer hover:border-tactical-red/60 ${
                      highlightedId === coach.id
                        ? "border-tactical-red ring-1 ring-tactical-red/30"
                        : "border-steel/30"
                    }`}
                    onClick={() => setHighlightedId(coach.id)}
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="relative h-14 w-14 shrink-0 rounded-sm overflow-hidden border border-steel/30">
                        {coach.avatar ? (
                            <Image
                              src={coach.avatar}
                              alt={coach.displayName}
                              fill
                              className="object-cover"
                            />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-steel/20">
                            <Shield className="h-6 w-6 text-steel" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-heading font-bold uppercase tracking-wide text-high-vis truncate">
                            {coach.displayName}
                          </p>
                          {coach.distanceMiles !== undefined &&
                            coach.distanceMiles !== null && (
                              <span className="shrink-0 text-xs text-tactical-red font-bold">
                                {coach.distanceMiles < 1
                                  ? "<1 mi"
                                  : `${coach.distanceMiles.toFixed(1)} mi`}
                              </span>
                            )}
                        </div>

                        {coach.location && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-steel shrink-0" />
                            <span className="text-xs text-muted-text truncate">
                              {coach.location}
                            </span>
                          </div>
                        )}

                        {coach.bio && (
                          <p className="mt-1.5 text-xs text-muted-text line-clamp-2">
                            {coach.bio}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                          {coach.years_experience && (
                            <span className="flex items-center gap-1 text-xs text-steel">
                              <Clock className="h-3 w-3" />
                              {coach.years_experience} yrs
                            </span>
                          )}
                          {coach.specialties && (
                            <span className="flex items-center gap-1 text-xs text-steel">
                              <Award className="h-3 w-3" />
                              {coach.specialties
                                .split(",")[0]
                                .trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/co/${coach.id}`}
                      className="mt-3 flex w-full items-center justify-center rounded-sm border border-tactical-red/40 py-1.5 text-xs font-heading font-bold uppercase tracking-wider text-tactical-red hover:bg-tactical-red/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View CO Profile
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map — right column */}
          <div className="flex-1 min-h-[400px] lg:min-h-0 rounded-sm overflow-hidden border border-steel/30">
            <CoachMap
              coaches={filteredCoaches}
              userLocation={userLocation}
              highlightedId={highlightedId}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
