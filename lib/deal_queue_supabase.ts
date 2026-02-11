import type { SavedDeal } from "./deal_queue_local";
import { supabase } from "./supabaseClient";

export type SupaDealRow = {
  id: string;
  created_at: string;
  user_id: string;
  vin: string;
  decoded: any;
  input: any;
  result: any;
  ladder: any;
  notes: string | null;
};

export async function upsertDealToSupabase(deal: SavedDeal) {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not signed in");

  const payload = {
    vin: deal.vin,
    decoded: deal.decoded,
    input: deal.input,
    result: deal.result,
    ladder: deal.ladder,
    notes: deal.notes || null,
  };

  // Insert a new row (id generated server-side)
  const { error } = await supabase.from("deals").insert(payload);
  if (error) throw error;
}

export async function listDealsFromSupabase(limit = 100): Promise<SavedDeal[]> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return [];

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as SupaDealRow[]).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    vin: r.vin,
    decoded: r.decoded,
    input: r.input,
    result: r.result,
    ladder: r.ladder,
    notes: r.notes || undefined,
  }));
}

export async function deleteDealFromSupabase(id: string) {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
}
