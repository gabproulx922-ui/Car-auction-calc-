"use client";

import { Currency, DealInput } from "@/lib/types";

type Props = {
  input: DealInput;
  setInput: (next: DealInput) => void;

  fxStatus: "idle" | "loading" | "ok" | "error";
  fetchFx: () => Promise<void>;
};

export default function SettingsPanel({ input, setInput, fxStatus, fetchFx }: Props) {
  const currency: Currency = input.currency;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Settings</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Default: Copart Canada • Pre-bid • Secured • Québec taxes
          </div>
        </div>
        <span className="pill">MVP</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginTop: 12 }}>
        <label>
          Devise
          <select
            value={currency}
            onChange={(e) => setInput({ ...input, currency: e.target.value as Currency })}
            style={{ width: "100%" }}
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <label>
          FX (1 USD → CAD)
          <input
            type="number"
            step="0.0001"
            value={input.fxUSDCAD}
            onChange={(e) => setInput({ ...input, fxUSDCAD: Number(e.target.value) || 1 })}
            style={{ width: "100%" }}
          />
        </label>

        <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
          <button onClick={fetchFx} style={{ width: "100%" }}>
            {fxStatus === "loading" ? "Auto (chargement…)" : "Auto (BoC)"}
          </button>
        </div>

        <label>
          Province (taxes)
          <select
            value={input.tax.province}
            onChange={(e) => setInput({ ...input, tax: { ...input.tax, province: e.target.value as any } })}
            style={{ width: "100%" }}
          >
            <option value="QC">QC</option>
            <option value="OTHER_CA">Autre CA</option>
          </select>
        </label>

        <label>
          Taxes
          <select
            value={input.tax.apply ? "ON" : "OFF"}
            onChange={(e) => setInput({ ...input, tax: { ...input.tax, apply: e.target.value === "ON" } })}
            style={{ width: "100%" }}
          >
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </label>

        <label>
          Base tax
          <select
            value={input.tax.taxBase}
            onChange={(e) => setInput({ ...input, tax: { ...input.tax, taxBase: e.target.value as any } })}
            style={{ width: "100%" }}
          >
            <option value="SALE_ONLY">Sale only</option>
            <option value="SALE_PLUS_FEES">Sale + fees</option>
          </select>
        </label>

        <label>
          Bid mode
          <select
            value={input.fee.bidMode}
            onChange={(e) => setInput({ ...input, fee: { ...input.fee, bidMode: e.target.value as any } })}
            style={{ width: "100%" }}
          >
            <option value="PRE_BID">Pre-bid</option>
            <option value="LIVE_BID">Live bid</option>
          </select>
        </label>

        <label>
          Payment
          <select
            value={input.fee.payment}
            onChange={(e) => setInput({ ...input, fee: { ...input.fee, payment: e.target.value as any } })}
            style={{ width: "100%" }}
          >
            <option value="SECURED">Secured</option>
            <option value="UNSECURED">Unsecured</option>
          </select>
        </label>
      </div>

      {fxStatus === "error" && (
        <div className="muted" style={{ marginTop: 10 }}>
          <span className="danger">FX auto failed.</span> Tu peux garder un taux manuel.
        </div>
      )}
    </div>
  );
}
