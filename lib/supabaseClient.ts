import { createClient } from "@supabase/supabase-js";

// Client-side Supabase (use NEXT_PUBLIC_* env vars)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // This is fine in dev until you configure .env.local / Vercel env vars.
  // We avoid throwing so the app can still run using localStorage mode.
  // eslint-disable-next-line no-console
  console.warn("Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
