import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, supabaseAuthed, getUserFromToken } from "../_auth_util.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function uploadToStorage(supabase: any, userId: string, url: string) {
  try {
    const res = await fetch(url);
    const buf = new Uint8Array(await res.arrayBuffer());
    const filename = `gen/${userId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from('content-assets').upload(filename, buf, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    const { data: publicUrl } = await supabase.storage.from('content-assets').getPublicUrl(filename);
    return publicUrl.publicUrl;
  } catch {
    return url; // fallback to external URL
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = supabaseAuthed(token);
    const body = await req.json().catch(()=>({}));
    const prompt: string = body?.prompt || 'brand image';

    let imageUrl: string | null = null;

    // 1) OpenAI (optional)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const r = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type':'application/json' },
          body: JSON.stringify({ prompt, n: 1, size: '1024x1024' })
        });
        const j = await r.json();
        imageUrl = j.data?.[0]?.url || null;
      } catch {}
    }

    // 2) Lexica (no key) search fallback
    if (!imageUrl) {
      try {
        const r = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`);
        const j = await r.json();
        const hit = (j.images || [])[0];
        imageUrl = hit?.src || hit?.imageUrls?.[0] || null;
      } catch {}
    }

    // 3) Pexels (free key) fallback if Lexica failed
    if (!imageUrl && Deno.env.get('PEXELS_API_KEY')) {
      try {
        const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=1`, {
          headers: { 'Authorization': Deno.env.get('PEXELS_API_KEY')! }
        });
        const j = await r.json();
        imageUrl = j.photos?.[0]?.src?.large || j.photos?.[0]?.url || null;
      } catch {}
    }

    if (!imageUrl) return new Response(JSON.stringify({ error: 'Image not available' }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

    // Optional upload to Supabase Storage (requires service role key on Edge project)
    let finalUrl = imageUrl;
    try { finalUrl = await uploadToStorage(supabase, user.id, imageUrl); } catch {}

    const payload = { id: crypto.randomUUID(), title: `Image for: ${prompt.slice(0,80)}`, created_at: new Date().toISOString(), data: { url: finalUrl } };
    return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  } catch (e) {
    console.error('generate-image() error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }
});
