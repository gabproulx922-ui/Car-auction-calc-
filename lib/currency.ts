import { Currency } from "./types";

// Store FX as 1 USD -> CAD
export function convert(amount: number, from: Currency, to: Currency, fxUSDCAD: number) {
  if (from === to) return amount;
  if (from === "USD" && to === "CAD") return amount * fxUSDCAD;
  if (from === "CAD" && to === "USD") return amount / fxUSDCAD;
  return amount;
}

export function fmt(amount: number, currency: Currency) {
  const f = new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  return f.format(isFinite(amount) ? amount : 0);
}
