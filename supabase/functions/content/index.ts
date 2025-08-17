import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, supabaseAuthed, getUserFromToken } from "../_auth_util.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const token = extractToken(req);
    const { data: { user }, error: authError } = await getUserFromToken(token);
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseClient = supabaseAuthed(token);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const brandId = url.searchParams.get('brand_id');
      const type = url.searchParams.get('type');

      let query = supabaseClient.from('content').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (brandId) query = query.eq('brand_id', brandId);
      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const id = body?.id; const updates = body?.updates || {};
      if (!id) return new Response(JSON.stringify({ error: "Missing content id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data, error } = await supabaseClient.from('content').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => ({}));
      const id = body?.id;
      if (!id) return new Response(JSON.stringify({ error: "Missing content id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { error } = await supabaseClient.from('content').delete().eq('id', id).eq('user_id', user.id);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('content() error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
