import { NextResponse } from "next/server";

// Fetch latest USD/CAD (FXUSDCAD) from Bank of Canada Valet API.
// Returns: { ok: true, fxUSDCAD: number, date: string }
export async function GET() {
  const url = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1";
  try {
    const res = await fetch(url, {
      // Exchange rates update daily; cache a bit to reduce calls
      next: { revalidate: 60 * 60 }, // 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "FX fetch failed." }, { status: 502 });
    }

    const data = await res.json();
    const obs = data?.observations?.[0];
    const date = obs?.d as string | undefined;
    const raw = obs?.FXUSDCAD?.v as string | undefined;
    const fx = raw ? Number(raw) : NaN;

    if (!isFinite(fx) || fx <= 0) {
      return NextResponse.json({ ok: false, error: "FX parse failed." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, fxUSDCAD: fx, date: date || "" });
  } catch {
    return NextResponse.json({ ok: false, error: "FX network error." }, { status: 502 });
  }
}
