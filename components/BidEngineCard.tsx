"use client";

import { useState } from "react";
import type { CalcResult, DealInput, DecodedVehicle, LadderRow } from "@/lib/types";
import { fmt } from "@/lib/currency";
import type { TDict } from "@/lib/i18n";
import { estimateExitValue } from "@/lib/estimate_exit_value";

type Props = {
  t: TDict;
  input: DealInput;
  setInput: (fn: (prev: DealInput) => DealInput) => void;
  decoded: DecodedVehicle | null;
  result: CalcResult | null;
  ladder: LadderRow[];
  onRecalc: () => void;
  onSave: () => void;
};

function isFR(t: TDict) {
  return t.notesTitle === "Notes MVP";
}

function pctLabel(p: number, t: TDict) {
  const v = Math.round(p * 100);
  return isFR(t) ? `${v} %` : `${v}%`;
}

export default function BidEngineCard({ t, input, setInput, decoded, result, ladder, onRecalc, onSave }: Props) {
  const [distStatus, setDistStatus] = useState<"idle" | "loading" | "error" | "ok">("idle");
  const estExit = estimateExitValue(decoded, input.currency, input.fxUSDCAD, input.mileageKm, input.conditionGrade);

  const transportEstimated =
    (Number(input.transportBaseFee) || 0) + (Number(input.transportDistanceKm) || 0) * (Number(input.transportRatePerKm) || 0);

  // keep exitValue in state (no manual entry)
  if (input.exitValue !== estExit) {
    Promise.resolve().then(() => setInput((p) => ({ ...p, exitValue: estExit })));
  }

  // keep transportCost synced if estimate mode is ON
  if (input.transportUseEstimate && input.transportCost !== Math.round(transportEstimated)) {
    Promise.resolve().then(() => setInput((p) => ({ ...p, transportCost: Math.round(transportEstimated) })));
  }

  const totalFixed = (input.partsCost || 0) + (input.transportCost || 0) + (input.timeCost || 0);
async function calcDistance() {
  const from = (input.transportOrigin || "").trim();
  const to = (input.transportDestination || "").trim();
  if (!from || !to) return;
  setDistStatus("loading");
  try {
    const res = await fetch(`/api/distance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      setDistStatus("error");
      return;
    }
    setInput((p) => ({ ...p, transportDistanceKm: Number(data.distanceKm) || 0 }));
    setDistStatus("ok");
  } catch {
    setDistStatus("error");
  }
}


  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t.bidTitle}</div>
          <div className="muted" style={{ fontSize: 13 }}>{t.bidSubtitle}</div>
        </div>
        <span className="pill">Pre-bid • Secured</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
        <div>
          <label>{t.estExitValue} ({input.currency})</label>
          <input value={String(estExit)} readOnly />
        </div>

        <div>
          <label>{t.mileage} (km)</label>
          <input
            value={String(input.mileageKm ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, mileageKm: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 120000" : "e.g. 120000"}
          />
        </div>

        <div>
          <label>{t.condition}</label>
          <select
            value={input.conditionGrade}
            onChange={(e) => setInput((p) => ({ ...p, conditionGrade: e.target.value as any }))}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <div>
          <label>{t.partsCost} ({input.currency})</label>
          <input
            value={String(input.partsCost ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, partsCost: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 800" : "e.g. 800"}
          />
        </div>

        <div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <label>{t.transportCost} ({input.currency})</label>
            <label className="muted" style={{ fontSize: 12 }}>
              <input
                type="checkbox"
                checked={Boolean(input.transportUseEstimate)}
                onChange={(e) => setInput((p) => ({ ...p, transportUseEstimate: e.target.checked }))}
                style={{ marginRight: 6 }}
              />
              {t.transportEstimate}
            </label>
          </div>
          <input
            value={String(input.transportCost ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, transportCost: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 1200" : "e.g. 1200"}
            readOnly={Boolean(input.transportUseEstimate)}
          />
        </div>

        <div>
          <label>{t.timeCost} ({input.currency})</label>
          <input
            value={String(input.timeCost ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, timeCost: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 600" : "e.g. 600"}
          />
        </div>

        <div>
          <label>{t.transportFrom}</label>
          <input
            value={input.transportOrigin ?? ""}
            onChange={(e) => setInput((p) => ({ ...p, transportOrigin: e.target.value }))}
            placeholder={isFR(t) ? "ex: Montréal, QC" : "e.g. Montreal, QC"}
          />
        </div>

        <div>
          <label>{t.transportTo}</label>
          <input
            value={input.transportDestination ?? ""}
            onChange={(e) => setInput((p) => ({ ...p, transportDestination: e.target.value }))}
            placeholder={isFR(t) ? "ex: Sherbrooke, QC" : "e.g. Sherbrooke, QC"}
          />
        </div>

        <div>
  <div className="row" style={{ justifyContent: "space-between" }}>
    <label>{t.transportDistance}</label>
    <button
      type="button"
      onClick={calcDistance}
      disabled={!input.transportOrigin?.trim() || !input.transportDestination?.trim() || distStatus === "loading"}
      style={{ padding: "8px 10px", borderRadius: 10, fontSize: 12 }}
    >
      {distStatus === "loading" ? (t.calcDistance + "…") : t.calcDistance}
    </button>
  </div>
  <input
    value={String(input.transportDistanceKm ?? "")}
    onChange={(e) => setInput((p) => ({ ...p, transportDistanceKm: Number(e.target.value) || 0 }))}
    placeholder={isFR(t) ? "ex: 160" : "e.g. 160"}
  />
  {distStatus === "error" ? (
    <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
      {isFR(t) ? "Erreur distance (vérifie ORS_API_KEY)." : "Distance error (check ORS_API_KEY)."}
    </div>
  ) : null}
</div>

        <div>
          <label>{t.transportBaseFee} ({input.currency})</label>
          <input
            value={String(input.transportBaseFee ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, transportBaseFee: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 250" : "e.g. 250"}
          />
        </div>

        <div>
          <label>{t.transportRate}</label>
          <input
            value={String(input.transportRatePerKm ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, transportRatePerKm: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 1.25" : "e.g. 1.25"}
          />
        </div>

        <div>
          <label>{t.profitPct}</label>
          <select
            value={String(input.profitPct)}
            onChange={(e) => setInput((p) => ({ ...p, profitPct: Number(e.target.value) }))}
          >
            <option value="0.2">{pctLabel(0.2, t)}</option>
            <option value="0.3">{pctLabel(0.3, t)}</option>
            <option value="0.4">{pctLabel(0.4, t)}</option>
          </select>
        </div>

        <div>
          <label>{isFR(t) ? "Total coûts fixes" : "Total fixed costs"} ({input.currency})</label>
          <input value={String(totalFixed)} readOnly />
        </div>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={onRecalc}>{t.calculate}</button>
        <button onClick={onSave}>{t.saveDeal}</button>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div className="muted" style={{ fontSize: 12 }}>{t.maxBid}</div>
          <div style={{ fontWeight: 900, fontSize: 26 }}>
            {result ? fmt(result.maxBid, input.currency) : fmt(0, input.currency)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="muted" style={{ fontSize: 12 }}>{t.profitLadder}</div>
        <table style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>PROFIT (%)</th>
              <th>{t.colProfit}</th>
              <th>{t.colMaxBid}</th>
              <th>{t.colFees}</th>
              <th>{t.colTaxes}</th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((r: any, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 800 }}>{pctLabel(r.profitPct ?? 0, t)}</td>
                <td style={{ fontWeight: 800 }}>{fmt(r.profitTarget, input.currency)}</td>
                <td style={{ fontWeight: 900 }}>{fmt(r.maxBid, input.currency)}</td>
                <td>{fmt(r.fees, input.currency)}</td>
                <td>{fmt(r.taxes, input.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
