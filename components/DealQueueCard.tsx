"use client";

import { useEffect, useMemo, useState } from "react";
import { fmt } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { deleteDeal, loadDeals, SavedDeal, clearDeals } from "@/lib/deal_queue_local";
import { supabase } from "@/lib/supabaseClient";
import { deleteDealFromSupabase, listDealsFromSupabase } from "@/lib/deal_queue_supabase";

type Props = {
  currency: Currency;
};

export default function DealQueueCard({ currency }: Props) {
  const [deals, setDeals] = useState<SavedDeal[]>([]);
  const [mode, setMode] = useState<"local" | "cloud">("local");
  const [cloudStatus, setCloudStatus] = useState<"idle" | "loading" | "error">("idle");

  async function refreshMode() {
    const { data } = await supabase.auth.getSession();
    const signedIn = Boolean(data.session?.user);
    setMode(signedIn ? "cloud" : "local");
  }

  async function refreshDeals() {
    await refreshMode();

    const { data } = await supabase.auth.getSession();
    const signedIn = Boolean(data.session?.user);

    if (!signedIn) {
      setDeals(loadDeals());
      return;
    }

    setCloudStatus("loading");
    try {
      const rows = await listDealsFromSupabase(200);
      setDeals(rows);
      setCloudStatus("idle");
    } catch {
      setCloudStatus("error");
    }
  }

  useEffect(() => {
    refreshDeals();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refreshDeals());
    return () => { sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => {
    return [...deals].sort((a, b) => (b.createdAt.localeCompare(a.createdAt)));
  }, [deals]);

  async function del(id: string) {
    if (mode === "cloud") {
      await deleteDealFromSupabase(id);
      await refreshDeals();
    } else {
      deleteDeal(id);
      setDeals(loadDeals());
    }
  }

  async function wipe() {
    if (mode === "cloud") {
      // For safety in MVP, we don't bulk-delete cloud deals.
      alert("Pour le mode cloud, supprime deal par deal (MVP).");
      return;
    }
    clearDeals();
    setDeals([]);
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Deal Queue</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Mode: <b>{mode === "cloud" ? "Supabase (cloud)" : "localStorage"}</b>
            {mode === "cloud" && cloudStatus === "loading" ? " · sync..." : ""}
            {mode === "cloud" && cloudStatus === "error" ? " · erreur sync" : ""}
          </div>
        </div>
        <div className="row">
          <span className="pill">{sorted.length} deals</span>
          <button onClick={refreshDeals}>Refresh</button>
          <button onClick={wipe} disabled={sorted.length === 0 || mode === "cloud"}>Clear</button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="muted" style={{ marginTop: 12 }}>Aucun deal sauvegardé.</div>
      ) : (
        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>VIN</th>
                <th>Véhicule</th>
                <th>Max bid</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.id}>
                  <td className="muted">{new Date(d.createdAt).toLocaleString("fr-CA")}</td>
                  <td style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{d.vin}</td>
                  <td>
                    {d.decoded
                      ? `${d.decoded.year} ${d.decoded.make} ${d.decoded.model}`
                      : <span className="muted">—</span>}
                  </td>
                  <td style={{ fontWeight: 900 }}>{fmt(d.result.maxBid, currency)}</td>
                  <td><button onClick={() => del(d.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
