import { CalcResult, DealInput, LadderRow } from "./types";
import { copartCanadaFees } from "./copart_ca_fees";
import { computeTaxes } from "./taxes";

export function computeMaxBid(input: DealInput): CalcResult {
  const { fee, tax, exitValue } = input;

  const totalFixedCosts =
    (input.partsCost || 0) + (input.transportCost || 0) + (input.timeCost || 0);

  const targetProfit = Math.max(0, (exitValue || 0) * (input.profitPct || 0));

  // iterative solve: bid = exit - fixed - profit - fees(bid) - taxes(bid, fees)
  let bid = Math.max(0, exitValue - totalFixedCosts - targetProfit);
  let last = -1;

  for (let i = 0; i < 25; i++) {
    const fees = copartCanadaFees(bid, fee);
    const taxes = computeTaxes(bid, fees.total, tax);

    const next =
      exitValue - totalFixedCosts - targetProfit - fees.total - taxes.total;

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

export function profitLadder(base: Omit<DealInput, "profitPct">): LadderRow[] {
  // Top 5 scenarios as profit % of exit value (AuctionCalc-style)
  const pcts = [0.10, 0.20, 0.30, 0.40, 0.50];

  return pcts.map((profitPct) => {
    const input: DealInput = { ...(base as any), profitPct };
    const r = computeMaxBid(input);
    return {
      profitPct,
      profitTarget: Math.round((input.exitValue || 0) * profitPct),
      maxBid: r.maxBid,
      fees: r.fees.total,
      taxes: r.taxes.total,
    };
  });
}
