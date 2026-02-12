"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { TDict } from "@/lib/i18n";

function isFR(t: TDict) {
  return t.notesTitle === "Notes MVP";
}

export default function AuthCard({ t }: { t: TDict }) {
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
        options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
      });
      if (error) throw error;
      setStatus("signedout");
      alert(isFR(t) ? "Lien de connexion envoyé ✅ Regarde tes emails." : "Login link sent ✅ Check your email.");
    } catch (e: any) {
      setError(e?.message || (isFR(t) ? "Erreur login" : "Login error"));
      setStatus("error");
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    await refresh();
  }

  const badge = status === "signedin" ? t.signedIn : t.signedOut;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t.supabaseTitle}</div>
          <div className="muted" style={{ fontSize: 13 }}>{t.supabaseSubtitle}</div>
        </div>
        <span className="pill">{badge}</span>
      </div>

      {!configured ? (
        <div className="muted" style={{ marginTop: 12 }}>
          {t.supabaseMissing}
          <div style={{ marginTop: 6, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            NEXT_PUBLIC_SUPABASE_URL<br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </div>
        </div>
      ) : status === "signedin" ? (
        <div className="row" style={{ marginTop: 12 }}>
          <div className="muted">Email: <b>{userEmail || "user"}</b></div>
          <button onClick={signOut} style={{ marginLeft: "auto" }}>{t.signOut}</button>
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div className="row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              style={{ flex: 1, minWidth: 260 }}
            />
            <button onClick={sendMagicLink} disabled={status === "sending" || !email}>
              {status === "sending" ? (t.sendLink + "…") : t.sendLink}
            </button>
          </div>
          {error ? <div className="muted danger" style={{ marginTop: 8 }}>{error}</div> : null}
        </div>
      )}
    </div>
  );
}
