"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AuthCard() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"unknown" | "signedout" | "signedin" | "sending" | "error">("unknown");
  const [userEmail, setUserEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function refresh() {
    if (!supabase) {
      setStatus("signedout");
      setUserEmail("");
      return;
    }
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user) {
      setStatus("signedin");
      setUserEmail(session.user.email || "");
    } else {
      setStatus("signedout");
      setUserEmail("");
    }
  }

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => { sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMagicLink() {
    if (!supabase) return;
    setError("");
    setStatus("sending");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setStatus("signedout");
      alert("Lien de connexion envoyé ✅ Regarde tes emails.");
    } catch (e: any) {
      setError(e?.message || "Erreur login");
      setStatus("error");
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    await refresh();
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Supabase Sync (optionnel)</div>
          <div className="muted" style={{ fontSize: 13 }}>
            Connecte-toi pour synchroniser la Deal Queue. Sinon, l'app reste en localStorage.
          </div>
        </div>
        {status === "signedin" ? <span className="pill">Signed in</span> : <span className="pill">Signed out</span>}
      </div>

      {!configured ? (
        <div className="muted" style={{ marginTop: 12 }}>
          Supabase n'est pas configuré. Ajoute les variables d'environnement :
          <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            NEXT_PUBLIC_SUPABASE_URL<br/>
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </div>
          <div style={{ marginTop: 6 }}>
            (Vercel → Project Settings → Environment Variables)
          </div>
        </div>
      ) : status === "signedin" ? (
        <div className="row" style={{ marginTop: 12 }}>
          <div className="muted">Connecté: <b>{userEmail || "user"}</b></div>
          <button onClick={signOut} style={{ marginLeft: "auto" }}>Sign out</button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div className="row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email pour magic link"
              style={{ flex: 1, minWidth: 260 }}
            />
            <button onClick={sendMagicLink} disabled={status === "sending" || !email}>
              {status === "sending" ? "Envoi…" : "Envoyer le lien"}
            </button>
          </div>
          {error ? <div className="muted danger" style={{ marginTop: 8 }}>{error}</div> : null}
        </div>
      )}
    </div>
  );
}
