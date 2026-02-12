import type { DecodedVehicle } from "./types";

export function estimateExitValueCAD(decoded: DecodedVehicle | null): number {
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
}

export function estimateExitValue(
  decoded: DecodedVehicle | null,
  currency: "CAD" | "USD",
  fxUSDCAD: number
): number {
  const cad = estimateExitValueCAD(decoded);
  if (currency === "CAD") return cad;
  const fx = Number(fxUSDCAD) || 1.35;
  return Math.round((cad / fx) * 100) / 100;
}
