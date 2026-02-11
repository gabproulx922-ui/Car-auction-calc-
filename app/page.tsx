"use client";

import { useEffect, useMemo, useState } from "react";
import SettingsPanel from "@/components/SettingsPanel";
import VinLookupCard from "@/components/VinLookupCard";
import BidEngineCard from "@/components/BidEngineCard";
import DealQueueCard from "@/components/DealQueueCard";

import type { CalcResult, DealInput, DecodedVehicle, LadderRow } from "@/lib/types";
import { computeMaxBid, profitLadder } from "@/lib/bid_engine";
import { saveDeal } from "@/lib/deal_queue_local";

function uid() {
  // simple unique id for localStorage
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default function Page() {
  const [vin, setVin] = useState("");
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(null);

  const [input, setInput] = useState<DealInput>({
    currency: "CAD",
    fxUSDCAD: 1.35,
    fee: { region: "CA", bidMode: "PRE_BID", payment: "SECURED" },
    tax: { province: "QC", apply: true, taxBase: "SALE_ONLY" },
    exitValue: 0,
    fixedCosts: 0,
    targetProfit: 1500,
  });

  const [fxStatus, setFxStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const [result, setResult] = useState<CalcResult | null>(null);
  const [ladder, setLadder] = useState<LadderRow[]>([]);

  const baseForLadder = useMemo(() => {
    const { targetProfit, ...rest } = input;
    return rest;
  }, [input]);

  function recalc() {
    // MVP assumes all amounts are in the selected display currency.
    // (When you later add US region, you can convert bid->CAD for CA fee tables, etc.)
    const r = computeMaxBid(input);
    setResult(r);
    setLadder(profitLadder(baseForLadder));
  }

  useEffect(() => {
    // compute initial ladder
    setLadder(profitLadder(baseForLadder));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFx() {
    setFxStatus("loading");
    try {
      const res = await fetch("/api/fx", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFxStatus("error");
        return;
      }
      setInput((prev) => ({ ...prev, fxUSDCAD: Number(data.fxUSDCAD) || prev.fxUSDCAD }));
      setFxStatus("ok");
    } catch {
      setFxStatus("error");
    }
  }

  function saveToQueue() {
    if (!result) return;
    const deal = {
      id: uid(),
      createdAt: new Date().toISOString(),
      vin: vin.trim().toUpperCase(),
      decoded,
      input,
      result,
      ladder,
    };
    saveDeal(deal);
    alert("Deal sauvegardé ✅ (Deal Queue)");
  }

  return (
    <main className="container">
      <h1 className="title">Copart BidCalc (MVP)</h1>
      <p className="subtitle">
        VIN decode + Copart Canada fees (Pre-bid/Secured) + Taxes QC + Profit ladder + Deal Queue
      </p>

      <div className="grid" style={{ gridTemplateColumns: "1fr", marginTop: 14 }}>
        <SettingsPanel input={input} setInput={setInput} fxStatus={fxStatus} fetchFx={fetchFx} />
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <VinLookupCard decoded={decoded} setDecoded={setDecoded} vin={vin} setVin={setVin} />
          <BidEngineCard
            input={input}
            setInput={setInput}
            result={result}
            ladder={ladder}
            onRecalc={recalc}
            onSave={saveToQueue}
          />
        </div>
        <DealQueueCard currency={input.currency} />
      </div>

      <div className="muted" style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5 }}>
        <div><b>Notes MVP</b></div>
        <div>• Les tables de frais Copart Canada sont intégrées en dur (Gate 79$, Env 10$, Virtual Bid Fee + Bidding Fees).</div>
        <div>• Les “Other fees” (storage, late, relist, etc.) ne sont pas inclus dans le calcul automatique.</div>
        <div>• Supabase (login + sync) est le prochain upgrade.</div>
      </div>
    </main>
  );
}
