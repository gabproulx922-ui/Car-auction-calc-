export function normalizeVin(input: string) {
  return (input || "").trim().toUpperCase();
}

// VIN: 17 chars, excludes I, O, Q
export function isValidVin(vin: string) {
  if (vin.length !== 17) return false;
  if (/[IOQ]/.test(vin)) return false;
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

export function safeText(v: unknown): string {
  return typeof v === "string" ? v : (v == null ? "" : String(v));
}
