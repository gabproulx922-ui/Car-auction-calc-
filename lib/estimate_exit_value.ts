import type { DecodedVehicle } from "./types";

export function estimateExitValueCAD(
  decoded: DecodedVehicle | null,
  mileageKm: number,
  conditionGrade: "A" | "B" | "C" | "D"
): number {
  // Base (CAD) from age only (MVP)
  const base = (() => {
    if (!decoded?.year) return 12000;

    const year = Number(decoded.year);
    const now = new Date().getFullYear();
    const age = Math.max(0, now - year);

    if (age <= 2) return 22000;
    if (age <= 4) return 17000;
    if (age <= 6) return 12500;
    if (age <= 9) return 9000;
    if (age <= 12) return 6500;
    if (age <= 15) return 4500;
    if (age <= 20) return 3000;
    return 2000;
  })();

  // Mileage adjustment (relative)
  const km = Math.max(0, Number(mileageKm) || 0);
  // Typical baseline: 20,000 km/year. Penalize above, bonus below.
  const year = Number(decoded?.year || new Date().getFullYear());
  const age = Math.max(1, new Date().getFullYear() - year);
  const expected = age * 20000;
  const ratio = expected > 0 ? km / expected : 1;

  // Cap mileage effect between -25% and +10%
  let mileageFactor = 1.0;
  if (km > 0) {
    if (ratio >= 1.0) {
      const over = Math.min(1.0, ratio - 1.0); // 0..1 for up to 2x expected
      mileageFactor = 1.0 - 0.25 * over; // down to -25%
    } else {
      const under = Math.min(1.0, 1.0 - ratio); // 0..1
      mileageFactor = 1.0 + 0.10 * under; // up to +10%
    }
  }

  // Condition adjustment
  const condFactor = (() => {
    switch (conditionGrade) {
      case "A": return 1.10; // very good
      case "B": return 1.00; // good/ok
      case "C": return 0.85; // rough
      case "D": return 0.70; // very rough
      default: return 1.0;
    }
  })();

  const est = base * mileageFactor * condFactor;

  // Clamp to sane bounds
  const min = 800;
  const max = 60000;
  return Math.round(Math.max(min, Math.min(max, est)));
}

export function estimateExitValue(
  decoded: DecodedVehicle | null,
  currency: "CAD" | "USD",
  fxUSDCAD: number,
  mileageKm: number,
  conditionGrade: "A" | "B" | "C" | "D"
): number {
  const cad = estimateExitValueCAD(decoded, mileageKm, conditionGrade);
  if (currency === "CAD") return cad;
  const fx = Number(fxUSDCAD) || 1.35;
  return Math.round((cad / fx) * 100) / 100;
}
