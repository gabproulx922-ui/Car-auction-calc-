import { TaxBreakdown, TaxConfig } from "./types";

export function computeTaxes(amountSale: number, amountFees: number, tax: TaxConfig): TaxBreakdown {
  if (!tax.apply) return { gst: 0, qst: 0, total: 0 };

  const base = tax.taxBase === "SALE_ONLY" ? amountSale : (amountSale + amountFees);

  // Québec: GST 5% ; QST 9.975% (MVP model)
  if (tax.province === "QC") {
    const gst = base * 0.05;
    const qst = base * 0.09975;
    return { gst, qst, total: gst + qst };
  }

  // Other Canada (MVP): GST only
  const gst = base * 0.05;
  return { gst, qst: 0, total: gst };
}
