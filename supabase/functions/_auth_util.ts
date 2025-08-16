import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

export function extractToken(req: Request): string {
  const raw = req.headers.get("Authorization") || req.headers.get("authorization") || "";
  const m = raw.match(/Bearer\s+(.+)/i);
  return (m?.[1] || "").trim();
}

export function supabaseAuthed(token: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    }
  );
}

export async function getUserFromToken(token: string) {
  const base = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
  return base.auth.getUser(token);
}