import type { DealInput, DecodedVehicle, CalcResult, LadderRow } from "./types";

export type SavedDeal = {
  id: string;
  createdAt: string;
  vin: string;
  decoded?: DecodedVehicle | null;
  input: DealInput;
  result: CalcResult;
  ladder: LadderRow[];
  notes?: string;
};

const KEY = "copart-bidcalc.deals.v1";

export function loadDeals(): SavedDeal[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedDeal[]) : [];
  } catch {
    return [];
  }
}

export function saveDeal(deal: SavedDeal) {
  const deals = loadDeals();
  const next = [deal, ...deals].slice(0, 300);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function deleteDeal(id: string) {
  const deals = loadDeals().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(deals));
}

export function clearDeals() {
  localStorage.removeItem(KEY);
}
