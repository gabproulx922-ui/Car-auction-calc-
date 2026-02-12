"use client";

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
  const estExit = estimateExitValue(decoded, input.currency, input.fxUSDCAD, input.mileageKm, input.conditionGrade);

  // keep in state (no manual entry)
  if (input.exitValue !== estExit) {
    Promise.resolve().then(() => setInput((p) => ({ ...p, exitValue: estExit })));
  }

  const totalFixed = (input.partsCost || 0) + (input.transportCost || 0) + (input.timeCost || 0);

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
          <label>{t.partsCost} ({input.currency})</label>
          <input
            value={String(input.partsCost ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, partsCost: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 800" : "e.g. 800"}
          />
        </div>

        <div>
          <label>{t.transportCost} ({input.currency})</label>
          <input
            value={String(input.transportCost ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, transportCost: Number(e.target.value) || 0 }))}
            placeholder={isFR(t) ? "ex: 1200" : "e.g. 1200"}
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
              <th>{isFR(t) ? "PROFIT (%)" : "PROFIT (%)"}</th>
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
