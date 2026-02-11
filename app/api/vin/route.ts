import { NextResponse } from "next/server";
import { isValidVin, normalizeVin, safeText } from "@/lib/vin";
import type { DecodedVehicle } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vin = normalizeVin(searchParams.get("vin") || "");

  if (!isValidVin(vin)) {
    return NextResponse.json({ ok: false, error: "VIN invalide (17 caractères, sans I/O/Q)." }, { status: 400 });
  }

  // NHTSA vPIC decode
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json({ ok: false, error: "Erreur VIN decode (NHTSA)." }, { status: 502 });
  }

  const data = await res.json();
  const r = data?.Results?.[0] ?? {};

  const decoded: DecodedVehicle = {
    vin,
    year: safeText(r.ModelYear),
    make: safeText(r.Make),
    model: safeText(r.Model),
    trim: safeText(r.Trim || r.Series),
    bodyClass: safeText(r.BodyClass),
    driveType: safeText(r.DriveType),
    engine: {
      cylinders: safeText(r.EngineCylinders),
      displacementL: safeText(r.DisplacementL),
      fuelType: safeText(r.FuelTypePrimary),
    },
  };

  const hasBasics = Boolean(decoded.year || decoded.make || decoded.model);
  if (!hasBasics) {
    return NextResponse.json({ ok: false, error: "VIN non reconnu / données indisponibles." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, decoded });
}
