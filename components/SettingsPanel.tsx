"use client";

import type { DealInput } from "@/lib/types";
import type { TDict } from "@/lib/i18n";

type Props = {
  t: TDict;
  input: DealInput;
  setInput: (fn: (prev: DealInput) => DealInput) => void;
  fxStatus: "idle" | "loading" | "ok" | "error";
  fetchFx: () => Promise<void>;
};

function isFR(t: TDict) {
  return t.notesTitle === "Notes MVP";
}

function taxBaseLabel(t: TDict, key: "SALE_ONLY" | "SALE_PLUS_FEES") {
  if (isFR(t)) return key === "SALE_ONLY" ? "Vente seulement" : "Vente + frais";
  return key === "SALE_ONLY" ? "Sale only" : "Sale + fees";
}

function bidModeLabel(t: TDict, key: "PRE_BID" | "LIVE_BID") {
  if (isFR(t)) return key === "PRE_BID" ? "Pre-bid" : "Live-bid";
  return key === "PRE_BID" ? "Pre-bid" : "Live-bid";
}

function paymentLabel(t: TDict, key: "SECURED" | "UNSECURED") {
  if (isFR(t)) return key === "SECURED" ? "Secured" : "Unsecured";
  return key === "SECURED" ? "Secured" : "Unsecured";
}

export default function SettingsPanel({ t, input, setInput, fxStatus, fetchFx }: Props) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t.settingsTitle}</div>
          <div className="muted" style={{ fontSize: 13 }}>{t.settingsSubtitle}</div>
        </div>
        <span className="pill">MVP</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        <div>
          <label>{t.currency}</label>
          <select
            value={input.currency}
            onChange={(e) => setInput((p) => ({ ...p, currency: e.target.value as any }))}
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div>
          <label>{t.fx}</label>
          <input
            value={String(input.fxUSDCAD ?? "")}
            onChange={(e) => setInput((p) => ({ ...p, fxUSDCAD: Number(e.target.value) || 0 }))}
            placeholder="1.35"
          />
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={fetchFx} style={{ width: "100%" }}>
            {t.fxAuto}{fxStatus === "loading" ? "…" : ""}
          </button>
        </div>

        <div>
          <label>{t.provinceTaxes}</label>
          <select
            value={input.tax.province}
            onChange={(e) => setInput((p) => ({ ...p, tax: { ...p.tax, province: e.target.value as any } }))}
          >
            <option value="QC">QC</option>
            <option value="ON">ON</option>
            <option value="BC">BC</option>
            <option value="AB">AB</option>
            <option value="MB">MB</option>
            <option value="SK">SK</option>
            <option value="NS">NS</option>
            <option value="NB">NB</option>
            <option value="NL">NL</option>
            <option value="PE">PE</option>
            <option value="YT">YT</option>
            <option value="NT">NT</option>
            <option value="NU">NU</option>
          </select>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 12 }}>
        <div>
          <label>{t.taxes}</label>
          <select
            value={input.tax.apply ? "ON" : "OFF"}
            onChange={(e) => setInput((p) => ({ ...p, tax: { ...p.tax, apply: e.target.value === "ON" } }))}
          >
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </div>

        <div>
          <label>{t.taxBase}</label>
          <select
            value={input.tax.taxBase}
            onChange={(e) => setInput((p) => ({ ...p, tax: { ...p.tax, taxBase: e.target.value as any } }))}
          >
            <option value="SALE_ONLY">{taxBaseLabel(t, "SALE_ONLY")}</option>
            <option value="SALE_PLUS_FEES">{taxBaseLabel(t, "SALE_PLUS_FEES")}</option>
          </select>
        </div>

        <div>
          <label>{t.bidMode}</label>
          <select
            value={input.fee.bidMode}
            onChange={(e) => setInput((p) => ({ ...p, fee: { ...p.fee, bidMode: e.target.value as any } }))}
          >
            <option value="PRE_BID">{bidModeLabel(t, "PRE_BID")}</option>
            <option value="LIVE_BID">{bidModeLabel(t, "LIVE_BID")}</option>
          </select>
        </div>

        <div>
          <label>{t.payment}</label>
          <select
            value={input.fee.payment}
            onChange={(e) => setInput((p) => ({ ...p, fee: { ...p.fee, payment: e.target.value as any } }))}
          >
            <option value="SECURED">{paymentLabel(t, "SECURED")}</option>
            <option value="UNSECURED">{paymentLabel(t, "UNSECURED")}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
