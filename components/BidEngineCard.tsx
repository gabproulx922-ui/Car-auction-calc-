"use client";

import { fmt } from "@/lib/currency";
import type { DealInput, CalcResult, LadderRow } from "@/lib/types";

type Props = {
  input: DealInput;
  setInput: (next: DealInput) => void;
  result: CalcResult | null;
  ladder: LadderRow[];
  onRecalc: () => void;
  onSave: () => void;
};

export default function BidEngineCard({ input, setInput, result, ladder, onRecalc, onSave }: Props) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>2) Bid engine</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Copart Canada fees + QC taxes + max bid (iterative)
          </div>
        </div>
        <span className="pill">Pre-bid • Secured</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginTop: 12 }}>
        <label>
          Exit value ({input.currency})
          <input
            type="number"
            value={input.exitValue || ""}
            onChange={(e) => setInput({ ...input, exitValue: Number(e.target.value) || 0 })}
            style={{ width: "100%" }}
            placeholder="ex: 12000"
          />
        </label>

        <label>
          Coûts fixes ({input.currency})
          <input
            type="number"
            value={input.fixedCosts || ""}
            onChange={(e) => setInput({ ...input, fixedCosts: Number(e.target.value) || 0 })}
            style={{ width: "100%" }}
            placeholder="ex: 2500"
          />
        </label>

        <label>
          Profit cible ({input.currency})
          <input
            type="number"
            value={input.targetProfit || ""}
            onChange={(e) => setInput({ ...input, targetProfit: Number(e.target.value) || 0 })}
            style={{ width: "100%" }}
            placeholder="ex: 1500"
          />
        </label>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={onRecalc}>Calculer</button>
        <button onClick={onSave} disabled={!result}>Sauvegarder dans Deal Queue</button>
        <div style={{ marginLeft: "auto" }}>
          <div className="muted" style={{ fontSize: 12 }}>Max Bid</div>
          <div className="kpi">{fmt(result?.maxBid ?? 0, input.currency)}</div>
        </div>
      </div>

      {result && (
        <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginTop: 12 }}>
          <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 14 }}>
            <div className="muted" style={{ fontSize: 12 }}>Fees (total)</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{fmt(result.fees.total, input.currency)}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Gate {fmt(result.fees.gateFee, input.currency)} · Env {fmt(result.fees.environmentalFee, input.currency)} · Buyer {fmt(result.fees.buyerFee, input.currency)} · VBF {fmt(result.fees.virtualBidFee, input.currency)}
            </div>
          </div>
          <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 14 }}>
            <div className="muted" style={{ fontSize: 12 }}>Taxes (total)</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{fmt(result.taxes.total, input.currency)}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              GST {fmt(result.taxes.gst, input.currency)} · QST {fmt(result.taxes.qst, input.currency)}
            </div>
          </div>
          <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 14 }}>
            <div className="muted" style={{ fontSize: 12 }}>Solver</div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{result.iterations} itérations</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Résout fees(bid) + taxes(bid) automatiquement.
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Profit ladder (Top 5)</div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Profit</th>
                <th>Max bid</th>
                <th>Fees</th>
                <th>Taxes</th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((r) => (
                <tr key={r.targetProfit}>
                  <td>{fmt(r.targetProfit, input.currency)}</td>
                  <td style={{ fontWeight: 800 }}>{fmt(r.maxBid, input.currency)}</td>
                  <td>{fmt(r.totalFees, input.currency)}</td>
                  <td>{fmt(r.totalTaxes, input.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
