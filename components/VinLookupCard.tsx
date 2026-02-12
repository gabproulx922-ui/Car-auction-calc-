"use client";

import { useEffect, useRef, useState } from "react";
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
  const lastRequested = useRef<string>("");

  async function decode(forcedVin?: string) {
    const v = (forcedVin ?? vin).trim().toUpperCase();
    if (v.length !== 17) return;

    // prevent spamming same VIN
    if (lastRequested.current === v && (status === "loading" || status === "ok")) return;
    lastRequested.current = v;

    setStatus("loading");
    try {
      const res = await fetch(`/api/vin?vin=${encodeURIComponent(v)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setStatus("error");
        setDecoded(null);
        return;
      }
      setDecoded(data.vehicle);
      setStatus("ok");
    } catch {
      setStatus("error");
      setDecoded(null);
    }
  }

  // Auto-decode with small debounce when VIN reaches 17 chars
  useEffect(() => {
    const v = vin.trim().toUpperCase();
    if (v.length !== 17) return;
    const timer = setTimeout(() => decode(v), 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vin]);

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
          onKeyDown={(e) => {
            if (e.key === "Enter") decode();
          }}
          placeholder={t.vinPlaceholder}
          style={{ flex: 1 }}
        />
        <button onClick={() => decode()} disabled={status === "loading" || vin.trim().length !== 17}>
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
              {(((decoded as any).fuelType || (decoded as any).fuelTypePrimary)
                ? `Fuel: ${((decoded as any).fuelType || (decoded as any).fuelTypePrimary)}`
                : null)}
            </div>
          </div>
        ) : (
          <div className="muted" style={{ marginTop: 20 }}>
            {status === "error"
              ? (isFR(t) ? "Erreur de décodage VIN. (Essaie d’ouvrir /api/vin?vin=TONVIN pour voir la réponse)" : "VIN decode error. (Try opening /api/vin?vin=YOURVIN to see the response)")
              : (isFR(t) ? "Entre un VIN (17 caractères). Décodage auto ou touche Entrée." : "Enter a 17‑char VIN. Auto decode or press Enter.")}
          </div>
        )}
      </div>
    </div>
  );
}
