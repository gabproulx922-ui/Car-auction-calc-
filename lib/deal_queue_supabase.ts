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

function requireSupabase() {
  if (!supabase) throw new Error("Supabase not configured");
  return supabase;
}

export async function insertDealToSupabase(deal: SavedDeal) {
  const sb = requireSupabase();

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not signed in");

  const payload = {
    vin: deal.vin,
    decoded: deal.decoded,
    input: deal.input,
    result: deal.result,
    ladder: deal.ladder,
    notes: deal.notes || null,
  };

  const { error } = await sb.from("deals").insert(payload);
  if (error) throw error;
}

export async function listDealsFromSupabase(limit = 100): Promise<SavedDeal[]> {
  const sb = requireSupabase();

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) return [];

  const { data, error } = await sb
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
  const sb = requireSupabase();
  const { error } = await sb.from("deals").delete().eq("id", id);
  if (error) throw error;
}
