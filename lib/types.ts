export type Currency = "CAD" | "USD";
export type Region = "CA" | "US";
export type Province = "QC" | "OTHER_CA";
export type PaymentSecurity = "SECURED" | "UNSECURED";
export type BidMode = "PRE_BID" | "LIVE_BID";

export type TaxConfig = {
  province: Province;
  apply: boolean;
  // In the real world, what gets taxed can vary by province + invoice rules.
  // For MVP this is configurable.
  taxBase: "SALE_ONLY" | "SALE_PLUS_FEES";
};

export type FeeConfig = {
  region: Region;              // MVP: CA implemented; US stubbed
  payment: PaymentSecurity;    // default SECURED
  bidMode: BidMode;            // default PRE_BID
};

export type DealInput = {
  currency: Currency;          // display currency
  fxUSDCAD: number;            // 1 USD -> CAD (used when converting)
  fee: FeeConfig;
  tax: TaxConfig;

  exitValue: number;           
  mileageKm: number;
  conditionGrade: \"A\" | \"B\" | \"C\" | \"D\";
// exit value in DISPLAY currency
  partsCost: number;
  transportCost: number;
  timeCost: number;          // repair + transport + misc in DISPLAY currency
  profitPct: number;        // profit target in DISPLAY currency
};

export type DecodedVehicle = {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyClass: string;
  driveType: string;
  engine: { cylinders: string; displacementL: string; fuelType: string };
};

export type FeeBreakdown = {
  gateFee: number;
  environmentalFee: number;
  buyerFee: number;
  virtualBidFee: number;
  total: number;
};

export type TaxBreakdown = {
  gst: number;
  qst: number;
  total: number;
};

export type CalcResult = {
  maxBid: number;
  fees: FeeBreakdown;
  taxes: TaxBreakdown;
  iterations: number;
};

export type LadderRow = {
  profitPct: number;
  targetProfit: number;
  maxBid: number;
  totalFees: number;
  totalTaxes: number;
};
