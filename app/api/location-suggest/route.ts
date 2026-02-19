import { NextRequest, NextResponse } from "next/server";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

function formatLocationLabel(row: NominatimResult): string {
  const city =
    row.address?.city ??
    row.address?.town ??
    row.address?.village ??
    row.address?.county;
  const state = row.address?.state;
  const country = row.address?.country;
  const compact = [city, state, country].filter(Boolean).join(", ");
  return compact || row.display_name;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "5", 10);
  const limit = Number.isNaN(limitParam)
    ? 5
    : Math.min(Math.max(limitParam, 1), 10);

  if (query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query)}` +
      `&format=jsonv2&addressdetails=1&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Glutton4Gainz/1.0",
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch location suggestions" },
        { status: 502 }
      );
    }

    const results = (await response.json()) as NominatimResult[];

    const suggestions = results
      .map((row) => ({
        label: formatLocationLabel(row),
        latitude: Number.parseFloat(row.lat),
        longitude: Number.parseFloat(row.lon),
      }))
      .filter(
        (row) =>
          Number.isFinite(row.latitude) && Number.isFinite(row.longitude)
      );

    return NextResponse.json(suggestions, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch location suggestions" },
      { status: 500 }
    );
  }
}
