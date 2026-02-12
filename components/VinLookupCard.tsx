"use client";

import { useState } from "react";
import type { DecodedVehicle } from "@/lib/types";
import type { TDict } from "@/lib/i18n";

type Props = {
  t: TDict;
  vin: string;
  setVin: (v: string) => void;
  decoded: DecodedVehicle | null;
  setDecoded: (v: DecodedVehicle | null) => void;
};

function isFR(t: TDict) {
  return t.notesTitle === "Notes MVP";
}

export default function VinLookupCard({ t, vin, setVin, decoded, setDecoded }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ok">("idle");

  async function decode() {
    const v = vin.trim().toUpperCase();
    if (v.length < 5) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/vin?vin=${encodeURIComponent(v)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        return;
      }
      setDecoded(data.vehicle);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t.vinTitle}</div>
          <div className="muted" style={{ fontSize: 13 }}>{t.vinSubtitle}</div>
        </div>
        <span className="pill">VIN</span>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder={t.vinPlaceholder}
          style={{ flex: 1 }}
        />
        <button onClick={decode} disabled={status === "loading"}>
          {status === "loading" ? (t.decode + "…") : t.decode}
        </button>
      </div>

      <div style={{ marginTop: 12, minHeight: 220 }}>
        {decoded ? (
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {decoded.year} {decoded.make} {decoded.model}
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              {decoded.trim ? `Trim: ${decoded.trim}` : null}
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              {decoded.bodyClass ? `Body: ${decoded.bodyClass}` : null}
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              {(((decoded as any).fuelType || (decoded as any).fuelTypePrimary) ? `Fuel: ${((decoded as any).fuelType || (decoded as any).fuelTypePrimary)}` : null)}
            </div>
          </div>
        ) : (
          <div className="muted" style={{ marginTop: 20 }}>
            {status === "error"
              ? (isFR(t) ? "Erreur de décodage VIN." : "VIN decode error.")
              : (isFR(t) ? "Entre un VIN puis clique Décoder." : "Enter a VIN and click Decode.")}
          </div>
        )}
      </div>
    </div>
  );
}
