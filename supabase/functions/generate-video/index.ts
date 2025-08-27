import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractToken, getUserFromToken, supabaseAuthed } from "../_auth_util.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function resolveKeys(supabase: any, userId: string) {
  const { data } = await supabase
    .from('provider_keys')
    .select('keys')
    .eq('user_id', userId)
    .single();
  
  const userKeys = data?.keys || {};
  
  return {
    replicate: userKeys.replicate || Deno.env.get('REPLICATE_API_TOKEN'),
    pexels: userKeys.pexels || Deno.env.get('PEXELS_API_KEY'),
    pixabay: userKeys.pixabay || Deno.env.get('PIXABAY_API_KEY'),
  };
}

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

async function generateReplicateVideo(prompt: string, replicateKey: string) {
  const replicate = new Replicate({ auth: replicateKey });
  
  try {
    const output = await replicate.run(
      "minimax/video-01",
      { input: { prompt: prompt } }
    );
    
    return Array.isArray(output) ? output[0] : output;
  } catch (error) {
    console.error('Replicate video generation failed:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  
  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = supabaseAuthed(token);
    const body = await req.json().catch(() => ({}));
    const { script, brand_id } = body;
    const prompt = script || 'brand trailer';
    const topic = prompt.slice(0, 80);

    // Resolve API keys with per-user priority
    const keys = await resolveKeys(supabase, user.id);

    let videoUrl: string | null = null;
    let provider = 'none';

    // Try Replicate AI video generation first
    if (keys.replicate) {
      try {
        videoUrl = await generateReplicateVideo(prompt, keys.replicate);
        if (videoUrl) provider = 'replicate';
      } catch (error) {
        console.log('Replicate failed:', error.message);
      }
    }

    // Fallback to stock video providers
    if (!videoUrl && keys.pexels) {
      try { 
        videoUrl = await pexelsVideo(topic, keys.pexels);
        if (videoUrl) provider = 'pexels';
      } catch (error) {
        console.log('Pexels failed:', error.message);
      }
    }

    if (!videoUrl && keys.pixabay) {
      try { 
        videoUrl = await pixabayVideo(topic, keys.pixabay);
        if (videoUrl) provider = 'pixabay';
      } catch (error) {
        console.log('Pixabay failed:', error.message);
      }
    }

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'No video provider configured. Add Replicate, Pexels, or Pixabay API key in Settings.' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create content record
    const contentId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('content')
      .insert({
        id: contentId,
        user_id: user.id,
        brand_id: brand_id || crypto.randomUUID(),
        type: 'video',
        title: `Video: ${topic}`,
        data: { url: videoUrl, script: prompt, provider },
        status: 'ready'
      });

    if (insertError) {
      console.error('Failed to save content:', insertError);
    }

    const result = {
      ok: true,
      provider,
      id: contentId,
      title: `Video: ${topic}`,
      created_at: new Date().toISOString(),
      data: { url: videoUrl, script: prompt, provider },
      meta: { duration: '30s', format: 'MP4' }
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('generate-video() error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
