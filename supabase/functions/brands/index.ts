import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { extractToken, supabaseAuthed, getUserFromToken } from "../_auth_util.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = supabaseAuthed(token);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      let query = supabase.from('brands').select('*').eq('user_id', user.id);

      if (id) {
        const { data, error } = await query.eq('id', id).single();
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
      return new Response(JSON.stringify(data || []), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      if (!body?.name || typeof body.name !== 'string') return new Response(JSON.stringify({ error: 'name is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
      const row = {
        user_id: user.id,
        name: String(body.name).trim(),
        voice: body.voice ?? null, tone: body.tone ?? null, style: body.style ?? null, assets: body.assets ?? null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('brands').upsert(row, { onConflict: 'user_id,name' }).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  } catch (error) {
    console.error('brands() error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }
});
