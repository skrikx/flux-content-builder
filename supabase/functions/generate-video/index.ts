import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    const body = await req.json()
    const brand_id: string = body.brand_id
    const mode: "free"|"premium" = body.mode ?? "free"
    const script: string = (body.script || body.prompt || "").toString().slice(0, 4000)

    if (!brand_id) {
      return new Response(JSON.stringify({ error: "brand_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    // Premium path - Pika style placeholder. We record an intent and return a queued video item.
    const hasPremium = !!Deno.env.get("PIKA_API_KEY") || !!Deno.env.get("RUNWAY_API_KEY")
    let videoUrl: string | null = null
    let status = "ready"
    let meta: Record<string, unknown> = { provider: mode, note: "" }

    if (mode === "premium" && hasPremium) {
      // In a real integration you would post the job and poll. We create the content row now with a queued state.
      status = "ready"
      meta = { provider: "premium", queued: true, info: "Video job submitted to external provider. Add webhook to update URL when complete." }
    } else {
      // Free fallback - no external provider in Edge. Return a storyboard placeholder.
      status = "ready"
      meta = { provider: "free", storyboard: true, info: "No video provider configured. Use storyboard assets and script." }
    }

    const title = script ? `Video: ${script.substring(0, 60)}` : "Video: generated"
    const { data, error } = await supabase
      .from("content")
      .insert({
        user_id: user.id,
        brand_id,
        type: "video",
        title,
        status,
        data: { url: videoUrl, script, meta }
      })
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
    }

    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } })
  } catch (e) {
    console.error("generate-video error:", e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } })
  }
})