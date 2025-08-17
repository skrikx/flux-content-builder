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
    const { data: { user } } = await getUserFromToken(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = supabaseAuthed(token);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const brandId = url.searchParams.get('brand_id');
      let q = supabase.from('schedules').select('*').eq('user_id', user.id).order('publish_at', { ascending: true });
      if (brandId) q = q.eq('brand_id', brandId);
      const { data, error } = await q;
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(()=>({}));
      const { content_id, brand_id, publish_at } = body || {};
      if (!content_id || !brand_id || !publish_at) return new Response(JSON.stringify({ error: 'content_id, brand_id, publish_at required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const row = { user_id: user.id, brand_id, content_id, publish_at };
      const { data, error } = await supabase.from('schedules').insert(row).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('schedule() error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
