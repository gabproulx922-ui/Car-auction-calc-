"use client";

import { useState } from "react";
import type { DecodedVehicle } from "@/lib/types";
import { normalizeVin, isValidVin } from "@/lib/vin";

type Props = {
  decoded: DecodedVehicle | null;
  setDecoded: (v: DecodedVehicle | null) => void;
  vin: string;
  setVin: (v: string) => void;
};

export default function VinLookupCard({ decoded, setDecoded, vin, setVin }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function lookup() {
    const v = normalizeVin(vin);
    setVin(v);
    setError("");
    setDecoded(null);

    if (!isValidVin(v)) {
      setError("VIN invalide (17 caractères, sans I/O/Q).");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`/api/vin?vin=${encodeURIComponent(v)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "VIN decode error.");
        setStatus("error");
        return;
      }
      setDecoded(data.decoded);
      setStatus("idle");
    } catch {
      setError("Erreur réseau.");
      setStatus("error");
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>1) VIN decode</div>
          <div className="muted" style={{ fontSize: 13 }}>NHTSA vPIC (gratuit)</div>
        </div>
        <span className="pill">VIN</span>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder="VIN (17 caractères)"
          style={{ flex: 1, minWidth: 260 }}
        />
        <button onClick={lookup} disabled={status === "loading"}>
          {status === "loading" ? "Décodage…" : "Décoder"}
        </button>
      </div>

      {error && <div className="muted danger" style={{ marginTop: 10 }}>{error}</div>}

      {decoded && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid var(--border)", background: "rgba(2,6,23,.25)" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>
            {decoded.year} {decoded.make} {decoded.model} {decoded.trim ? `(${decoded.trim})` : ""}
          </div>
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {decoded.bodyClass ? <>Body: {decoded.bodyClass} · </> : null}
            {decoded.driveType ? <>Drive: {decoded.driveType} · </> : null}
            {decoded.engine?.fuelType ? <>Fuel: {decoded.engine.fuelType}</> : null}
          </div>
        </div>
      )}
    </div>
  );
}
