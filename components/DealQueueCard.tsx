"use client";

import { useEffect, useMemo, useState } from "react";
import { fmt } from "@/lib/currency";
import type { Currency } from "@/lib/types";
import { deleteDeal, loadDeals, SavedDeal, clearDeals } from "@/lib/deal_queue_local";

type Props = {
  currency: Currency;
};

export default function DealQueueCard({ currency }: Props) {
  const [deals, setDeals] = useState<SavedDeal[]>([]);

  useEffect(() => {
    setDeals(loadDeals());
  }, []);

  const sorted = useMemo(() => {
    return [...deals].sort((a, b) => (b.createdAt.localeCompare(a.createdAt)));
  }, [deals]);

  function del(id: string) {
    deleteDeal(id);
    setDeals(loadDeals());
  }

  function wipe() {
    clearDeals();
    setDeals([]);
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Deal Queue</div>
          <div className="muted" style={{ fontSize: 13 }}>Sauvegarde locale (localStorage). Supabase = prochain upgrade.</div>
        </div>
        <div className="row">
          <span className="pill">{sorted.length} deals</span>
          <button onClick={wipe} disabled={sorted.length === 0}>Clear</button>
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
