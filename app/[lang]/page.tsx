"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SettingsPanel from "@/components/SettingsPanel";
import VinLookupCard from "@/components/VinLookupCard";
import BidEngineCard from "@/components/BidEngineCard";
import DealQueueCard from "@/components/DealQueueCard";
import AuthCard from "@/components/AuthCard";

import type { CalcResult, DealInput, DecodedVehicle, LadderRow } from "@/lib/types";
import { computeMaxBid, profitLadder } from "@/lib/bid_engine";
import { saveDeal } from "@/lib/deal_queue_local";
import { insertDealToSupabase } from "@/lib/deal_queue_supabase";
import { supabase } from "@/lib/supabaseClient";

const dict = {
  fr: {
    title: "Copart BidCalc (MVP)",
    subtitle:
      "Décodage VIN + frais Copart Canada (Pre-bid/Secured) + taxes QC + profit ladder + Deal Queue",
    savedLocal: "Deal sauvegardé ✅ (localStorage)",
    savedCloud: "Deal sauvegardé ✅ (Supabase cloud)",
    notesTitle: "Notes MVP",
    notes1:
      "• Les tables de frais Copart Canada sont intégrées en dur (Gate 79$, Env 10$, Virtual Bid Fee + Bidding Fees).",
    notes2:
      "• Les “Other fees” (storage, late, relist, etc.) ne sont pas inclus dans le calcul automatique.",
    notes3:
      "• Deal Queue: localStorage par défaut, et sync Supabase si tu te connectes.",
  },
  en: {
    title: "Copart BidCalc (MVP)",
    subtitle:
      "VIN decode + Copart Canada fees (Pre-bid/Secured) + QC taxes + profit ladder + Deal Queue",
    savedLocal: "Saved ✅ (localStorage)",
    savedCloud: "Saved ✅ (Supabase cloud)",
    notesTitle: "MVP notes",
    notes1:
      "• Copart Canada fee tables are hard-coded (Gate $79, Env $10, Virtual Bid Fee + Bidding Fees).",
    notes2:
      "• Other fees (storage, late, relist, etc.) are not included in the calculation.",
    notes3:
      "• Deal Queue uses localStorage by default, and syncs to Supabase when signed in.",
  },
} as const;

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default async function Page({ params }: { params: Promise<{ lang: "fr" | "en" }> }) {
  const { lang } = await params;

  const t = dict[lang];
  const other = lang === "fr" ? "en" : "fr";

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
    const r = computeMaxBid(input);
    setResult(r);
    setLadder(profitLadder(baseForLadder));
  }

  useEffect(() => {
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

  async function saveToQueue() {
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

    try {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const signedIn = Boolean(data.session?.user);
        if (signedIn) {
          await insertDealToSupabase(deal);
          alert(t.savedCloud);
          return;
        }
      }
    } catch {}

    saveDeal(deal);
    alert(t.savedLocal);
  }

  return (
    <main className="container">
      {/* Language switch */}
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Link className="pill" href={`/${other}`}>{other.toUpperCase()}</Link>
      </div>

      <h1 className="title">{t.title}</h1>
      <p className="subtitle">{t.subtitle}</p>

      <div className="grid" style={{ gridTemplateColumns: "1fr", marginTop: 14 }}>
        <SettingsPanel input={input} setInput={setInput} fxStatus={fxStatus} fetchFx={fetchFx} />
        <AuthCard />
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
        <div><b>{t.notesTitle}</b></div>
        <div>{t.notes1}</div>
        <div>{t.notes2}</div>
        <div>{t.notes3}</div>
      </div>
    </main>
  );
}
