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
import { t as tt, type Lang } from "@/lib/i18n";
import { estimateExitValue } from "@/lib/estimate_exit_value";

const subtitles = {
  fr: "Décodage VIN + frais Copart Canada (Pre-bid/Secured) + taxes QC + profit ladder + Deal Queue",
  en: "VIN decode + Copart Canada fees (Pre-bid/Secured) + QC taxes + profit ladder + Deal Queue",
} as const;

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export default function LangAppClient({ lang }: { lang: Lang }) {
  const tr = tt(lang);
  const other = lang === "fr" ? "en" : "fr";

  const [vin, setVin] = useState("");
  const [decoded, setDecoded] = useState<DecodedVehicle | null>(null);

  const [input, setInput] = useState<DealInput>({
    currency: "CAD",
    fxUSDCAD: 1.35,
    fee: { region: "CA", bidMode: "PRE_BID", payment: "SECURED" },
    tax: { province: "QC", apply: true, taxBase: "SALE_ONLY" },
    exitValue: 12000, // auto-estimated
    mileageKm: 120000,
    conditionGrade: "B",
    partsCost: 0,
    transportCost: 0,
    timeCost: 0,
    profitPct: 0.3,
  });

  const [fxStatus, setFxStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const [result, setResult] = useState<CalcResult | null>(null);
  const [ladder, setLadder] = useState<LadderRow[]>([]);

  const baseForLadder = useMemo(() => {
    const { targetProfit, ...rest } = input;
    return rest;
  }, [input]);

  // Auto-estimate exit value when VIN/currency/fx changes
  useEffect(() => {
    setInput((prev) => ({ ...prev, exitValue: estimateExitValue(decoded, prev.currency, prev.fxUSDCAD, prev.mileageKm, prev.conditionGrade) }));
  }, [decoded, input.currency, input.fxUSDCAD, input.mileageKm, input.conditionGrade]);

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
          alert(lang === "fr" ? "Deal sauvegardé ✅ (Supabase cloud)" : "Saved ✅ (Supabase cloud)");
          return;
        }
      }
    } catch {}

    saveDeal(deal);
    alert(lang === "fr" ? "Deal sauvegardé ✅ (localStorage)" : "Saved ✅ (localStorage)");
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <Link className="pill" href={`/${other}`}>{other.toUpperCase()}</Link>
      </div>

      <h1 className="title">Copart BidCalc (MVP)</h1>
      <p className="subtitle">{subtitles[lang]}</p>

      <div className="grid" style={{ gridTemplateColumns: "1fr", marginTop: 14 }}>
        <SettingsPanel t={tr} input={input} setInput={setInput} fxStatus={fxStatus} fetchFx={fetchFx} />
        <AuthCard t={tr} />
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <VinLookupCard t={tr} decoded={decoded} setDecoded={setDecoded} vin={vin} setVin={setVin} />
          <BidEngineCard
            t={tr}
            input={input}
            setInput={setInput}
            decoded={decoded}
            result={result}
            ladder={ladder}
            onRecalc={recalc}
            onSave={saveToQueue}
          />
        </div>
        <DealQueueCard t={tr} currency={input.currency} />
      </div>

      <div className="muted" style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5 }}>
        <div><b>{tr.notesTitle}</b></div>
        <div>• {lang === "fr"
          ? "Les tables de frais Copart Canada sont intégrées en dur (Gate 79$, Env 10$, Virtual Bid Fee + Bidding Fees)."
          : "Copart Canada fee tables are hard-coded (Gate $79, Env $10, Virtual Bid Fee + Bidding Fees)."}
        </div>
        <div>• {lang === "fr"
          ? "Les “Other fees” (storage, late, relist, etc.) ne sont pas inclus dans le calcul automatique."
          : "Other fees (storage, late, relist, etc.) are not included in the calculation."}
        </div>
        <div>• {lang === "fr"
          ? "Deal Queue: localStorage par défaut, et sync Supabase si tu te connectes."
          : "Deal Queue uses localStorage by default, and syncs to Supabase when signed in."}
        </div>
      </div>
    </main>
  );
}
