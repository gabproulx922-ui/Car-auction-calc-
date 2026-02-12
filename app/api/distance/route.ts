import { NextResponse } from "next/server";

type GeocodeFeature = {
  geometry?: { coordinates?: [number, number] };
};

async function geocodeOne(q: string, apiKey: string) {
  const url = `https://api.openrouteservice.org/geocode/search?size=1&text=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    // no caching in serverless
    cache: "no-store",
  });
  const data = await res.json();
  const feature: GeocodeFeature | undefined = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lng, lat] = coords;
  return { lng, lat };
}

export async function GET(req: Request) {
  try {
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing ORS_API_KEY env var" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const from = (searchParams.get("from") || "").trim();
    const to = (searchParams.get("to") || "").trim();

    if (!from || !to) {
      return NextResponse.json({ ok: false, error: "Missing from/to" }, { status: 400 });
    }

    const a = await geocodeOne(from, apiKey);
    const b = await geocodeOne(to, apiKey);
    if (!a || !b) {
      return NextResponse.json({ ok: false, error: "Geocode failed" }, { status: 400 });
    }

    const dirUrl = "https://api.openrouteservice.org/v2/directions/driving-car";
    const body = {
      coordinates: [
        [a.lng, a.lat],
        [b.lng, b.lat],
      ],
      units: "km",
    };

    const dirRes = await fetch(dirUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const dir = await dirRes.json();
    const meters = dir?.features?.[0]?.properties?.segments?.[0]?.distance; // in km because units=km
    const durationSec = dir?.features?.[0]?.properties?.segments?.[0]?.duration;

    if (typeof meters !== "number") {
      return NextResponse.json({ ok: false, error: "Directions failed" }, { status: 400 });
    }

    const distanceKm = meters; // already km
    return NextResponse.json({
      ok: true,
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin: typeof durationSec === "number" ? Math.round(durationSec / 60) : null,
      from,
      to,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
