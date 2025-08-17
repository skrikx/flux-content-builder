import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, getUserFromToken } from "../_auth_util.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function pexelsVideo(query: string, key: string) {
  const r = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=1`, { headers: { 'Authorization': key } });
  const j = await r.json();
  const v = j.videos?.[0];
  if (!v) return null;
  // Prefer 720p/HD file
  const file = (v.video_files || []).find((f:any)=> f.quality==='hd') || v.video_files?.[0];
  return file?.link || v.url || null;
}

async function pixabayVideo(query: string, key: string) {
  const r = await fetch(`https://pixabay.com/api/videos/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&per_page=3`);
  const j = await r.json();
  const v = j.hits?.[0];
  if (!v) return null;
  const file = v.videos?.medium?.url || v.videos?.large?.url;
  return file || null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

    const body = await req.json().catch(()=>({}));
    const script: string = body?.script || 'brand trailer';
    const topic = script.slice(0, 80);

    let videoUrl: string | null = null;

    const pexKey = Deno.env.get('PEXELS_API_KEY');
    if (pexKey) {
      try { videoUrl = await pexelsVideo(topic, pexKey); } catch {}
    }

    if (!videoUrl) {
      const pxbKey = Deno.env.get('PIXABAY_API_KEY');
      if (pxbKey) {
        try { videoUrl = await pixabayVideo(topic, pxbKey); } catch {}
      }
    }

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'No free video provider configured (set PEXELS_API_KEY or PIXABAY_API_KEY)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
    }

    const payload = { id: crypto.randomUUID(), title: `Video for: ${topic}`, created_at: new Date().toISOString(), data: { url: videoUrl, script } };
    return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  } catch (e) {
    console.error('generate-video() error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }
});
