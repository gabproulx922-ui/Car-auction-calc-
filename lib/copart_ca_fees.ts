import { FeeConfig, FeeBreakdown } from "./types";

type FlatBracket = { min: number; max: number; fee: number };
type PercentBracket = { min: number; max: number; pct: number };
type Bracket = FlatBracket | PercentBracket;

const GATE_FEE_CA = 79;
const ENV_FEE_CA = 10;

// Virtual Bid Fee - Canada (Pre-Bid / Live Bid)
const VBF_CA_PRE: FlatBracket[] = [
  { min: 0, max: 99.99, fee: 0 },
  { min: 100, max: 499.99, fee: 39 },
  { min: 500, max: 999.99, fee: 49 },
  { min: 1000, max: 1499.99, fee: 69 },
  { min: 1500, max: 1999.99, fee: 79 },
  { min: 2000, max: 3999.99, fee: 89 },
  { min: 4000, max: 5999.99, fee: 99 },
  { min: 6000, max: 7999.99, fee: 119 },
  { min: 8000, max: Number.POSITIVE_INFINITY, fee: 129 },
];

const VBF_CA_LIVE: FlatBracket[] = [
  { min: 0, max: 99.99, fee: 0 },
  { min: 100, max: 499.99, fee: 49 },
  { min: 500, max: 999.99, fee: 59 },
  { min: 1000, max: 1499.99, fee: 79 },
  { min: 1500, max: 1999.99, fee: 89 },
  { min: 2000, max: 3999.99, fee: 99 },
  { min: 4000, max: 5999.99, fee: 109 },
  { min: 6000, max: 7999.99, fee: 139 },
  { min: 8000, max: Number.POSITIVE_INFINITY, fee: 149 },
];

// Bidding Fees - Standard Pricing - Canada
// Secured Payment Methods
const BUYER_CA_SECURED: Bracket[] = [
  { min: 0, max: 49.99, fee: 115 },
  { min: 50, max: 99.99, fee: 115 },
  { min: 100, max: 199.99, fee: 140 },
  { min: 200, max: 299.99, fee: 175 },
  { min: 300, max: 399.99, fee: 205 },
  { min: 400, max: 499.99, fee: 235 },
  { min: 500, max: 599.99, fee: 260 },
  { min: 600, max: 699.99, fee: 300 },
  { min: 700, max: 799.99, fee: 310 },
  { min: 800, max: 899.99, fee: 320 },
  { min: 900, max: 999.99, fee: 320 },
  { min: 1000, max: 1199.99, fee: 340 },
  { min: 1200, max: 1299.99, fee: 350 },
  { min: 1300, max: 1399.99, fee: 365 },
  { min: 1400, max: 1499.99, fee: 380 },
  { min: 1500, max: 1599.99, fee: 390 },
  { min: 1600, max: 1699.99, fee: 410 },
  { min: 1700, max: 1799.99, fee: 420 },
  { min: 1800, max: 1999.99, fee: 440 },
  { min: 2000, max: 2399.99, fee: 470 },
  { min: 2400, max: 2499.99, fee: 480 },
  { min: 2500, max: 2999.99, fee: 500 },
  { min: 3000, max: 3499.99, fee: 600 },
  { min: 3500, max: 3999.99, fee: 675 },
  { min: 4000, max: 4499.99, fee: 710 },
  { min: 4500, max: 4999.99, fee: 750 },
  { min: 5000, max: 5999.99, fee: 750 },
  { min: 6000, max: 7499.99, fee: 800 },
  { min: 7500, max: 7999.99, fee: 815 },
  { min: 8000, max: 8499.99, fee: 840 },
  { min: 8500, max: 8999.99, fee: 840 },
  { min: 9000, max: 9999.99, fee: 840 },
  { min: 10000, max: 10499.99, fee: 875 },
  { min: 10500, max: 10999.99, fee: 900 },
  { min: 11000, max: 11499.99, fee: 925 },
  { min: 11500, max: 11999.99, fee: 950 },
  { min: 12000, max: 12499.99, fee: 975 },
  { min: 12500, max: 14999.99, fee: 1000 },
  { min: 15000, max: Number.POSITIVE_INFINITY, pct: 0.0725 },
];

// Unsecured Payment Methods
const BUYER_CA_UNSECURED: Bracket[] = [
  { min: 0, max: 49.99, fee: 125 },
  { min: 50, max: 99.99, fee: 125 },
  { min: 100, max: 199.99, fee: 150 },
  { min: 200, max: 299.99, fee: 185 },
  { min: 300, max: 399.99, fee: 220 },
  { min: 400, max: 499.99, fee: 255 },
  { min: 500, max: 599.99, fee: 285 },
  { min: 600, max: 699.99, fee: 330 },
  { min: 700, max: 799.99, fee: 345 },
  { min: 800, max: 899.99, fee: 360 },
  { min: 900, max: 999.99, fee: 365 },
  { min: 1000, max: 1199.99, fee: 390 },
  { min: 1200, max: 1299.99, fee: 415 },
  { min: 1300, max: 1399.99, fee: 435 },
  { min: 1400, max: 1499.99, fee: 455 },
  { min: 1500, max: 1599.99, fee: 470 },
  { min: 1600, max: 1699.99, fee: 495 },
  { min: 1700, max: 1799.99, fee: 510 },
  { min: 1800, max: 1999.99, fee: 540 },
  { min: 2000, max: 2399.99, fee: 590 },
  { min: 2400, max: 2499.99, fee: 605 },
  { min: 2500, max: 2999.99, fee: 650 },
  { min: 3000, max: 3499.99, fee: 775 },
  { min: 3500, max: 3999.99, fee: 875 },
  { min: 4000, max: 4499.99, fee: 935 },
  { min: 4500, max: 4999.99, fee: 1000 },
  { min: 5000, max: 5999.99, fee: 1000 },
  { min: 6000, max: 7499.99, fee: 1050 },
  { min: 7500, max: 7999.99, fee: 1075 },
  { min: 8000, max: 8499.99, fee: 1120 },
  { min: 8500, max: 8999.99, fee: 1170 },
  { min: 9000, max: 9999.99, fee: 1225 },
  { min: 10000, max: 10499.99, fee: 1335 },
  { min: 10500, max: 10999.99, fee: 1385 },
  { min: 11000, max: 11499.99, fee: 1430 },
  { min: 11500, max: 11999.99, fee: 1480 },
  { min: 12000, max: 12499.99, fee: 1525 },
  { min: 12500, max: 14999.99, fee: 1620 },
  { min: 15000, max: Number.POSITIVE_INFINITY, pct: 0.1225 },
];

function bracketFee(brackets: Bracket[], bid: number): number {
  const b = brackets.find(x => bid >= x.min && bid <= x.max);
  if (!b) return 0;
  if ("fee" in b) return b.fee;
  return bid * b.pct;
}

export function copartCanadaFees(bid: number, cfg: FeeConfig): FeeBreakdown {
  const buyerTable = cfg.payment === "SECURED" ? BUYER_CA_SECURED : BUYER_CA_UNSECURED;
  const vbfTable = cfg.bidMode === "PRE_BID" ? VBF_CA_PRE : VBF_CA_LIVE;

  const buyerFee = bracketFee(buyerTable, bid);
  const virtualBidFee = bracketFee(vbfTable, bid);

  return {
    gateFee: GATE_FEE_CA,
    environmentalFee: ENV_FEE_CA,
    buyerFee,
    virtualBidFee,
    total: GATE_FEE_CA + ENV_FEE_CA + buyerFee + virtualBidFee,
  };
}
