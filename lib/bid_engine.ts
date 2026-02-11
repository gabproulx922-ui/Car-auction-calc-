import { CalcResult, DealInput, LadderRow } from "./types";
import { copartCanadaFees } from "./copart_ca_fees";
import { computeTaxes } from "./taxes";

export function computeMaxBid(input: DealInput): CalcResult {
  const { fee, tax, exitValue, fixedCosts, targetProfit } = input;

  let bid = Math.max(0, exitValue - fixedCosts - targetProfit);
  let last = -1;

  for (let i = 0; i < 25; i++) {
    const fees = copartCanadaFees(bid, fee);
    const taxes = computeTaxes(bid, fees.total, tax);

    const next = exitValue - fixedCosts - targetProfit - fees.total - taxes.total;

    if (Math.abs(next - bid) < 0.5 || next === last) {
      bid = next;
      return { maxBid: Math.max(0, Math.floor(bid)), fees, taxes, iterations: i + 1 };
    }

    last = bid;
    bid = next;
  }

  const fees = copartCanadaFees(bid, fee);
  const taxes = computeTaxes(bid, fees.total, tax);
  return { maxBid: Math.max(0, Math.floor(bid)), fees, taxes, iterations: 25 };
}

export function profitLadder(base: Omit<DealInput, "targetProfit">): LadderRow[] {
  const profits = [1000, 1500, 2000, 2500, 3000];
  return profits.map((p) => {
    const r = computeMaxBid({ ...base, targetProfit: p });
    return {
      targetProfit: p,
      maxBid: r.maxBid,
      totalFees: r.fees.total,
      totalTaxes: r.taxes.total,
    };
  });
}
