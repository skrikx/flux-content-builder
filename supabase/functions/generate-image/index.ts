import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
import { extractToken, supabaseAuthed, getUserFromToken } from "../_auth_util.ts";
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function uploadToStorage(supabase: SupabaseClient, userId: string, url: string) {
  try {
    const res = await fetch(url);
    const buf = new Uint8Array(await res.arrayBuffer());
    const filename = `gen/${userId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from('content-assets').upload(filename, buf, { contentType: 'image/jpeg', upsert: true });
    if (error) throw error;
    const { data: publicUrl } = await supabase.storage.from('content-assets').getPublicUrl(filename);
    return publicUrl.publicUrl;
  } catch (error) {
    console.warn('Failed to upload to storage:', error);
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
    let imageBase64: string | null = null;

    // 1) Hugging Face (free tier - preferred)
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (hfToken) {
      try {
        console.log('Generating image with Hugging Face...');
        const hf = new HfInference(hfToken);
        const image = await hf.textToImage({
          inputs: prompt,
          model: 'black-forest-labs/FLUX.1-schnell',
        });
        
        // Convert blob to base64 safely
        const arrayBuffer = await image.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const chunks = [];
        for (let i = 0; i < uint8Array.length; i += 8192) {
          chunks.push(String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + 8192))));
        }
        const base64 = btoa(chunks.join(''));
        imageBase64 = `data:image/png;base64,${base64}`;
        console.log('Successfully generated image with Hugging Face');
      } catch (error) {
        console.log('Hugging Face generation failed:', error);
      }
    }

    // 2) OpenAI (premium fallback)
    if (!imageBase64 && !imageUrl) {
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
        } catch (error) {
          console.warn('OpenAI image generation failed:', error);
        }
      }
    }

    // 3) Lexica (no key) search fallback  
    if (!imageBase64 && !imageUrl) {
      try {
        const r = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`);
        const j = await r.json();
        const hit = (j.images || [])[0];
        imageUrl = hit?.src || hit?.imageUrls?.[0] || null;
      } catch (error) {
        console.warn('Lexica search failed:', error);
      }
    }

    if (!imageBase64 && !imageUrl) return new Response(JSON.stringify({ error: 'Image generation not available' }), { status: 400, headers: { ...corsHeaders, 'Content-Type':'application/json' } });

    let finalUrl = imageBase64 || imageUrl;
    
    // Only try to upload external URLs to storage, not base64 images
    if (imageUrl && !imageBase64) {
      try { 
        finalUrl = await uploadToStorage(supabase, user.id, imageUrl); 
      } catch (error) {
        console.warn('Storage upload failed, using external URL:', error);
      }
    }

    const payload = { id: crypto.randomUUID(), title: `Image for: ${prompt.slice(0,80)}`, created_at: new Date().toISOString(), data: { url: finalUrl } };
    return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  } catch (e) {
    console.error('generate-image() error', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type':'application/json' } });
  }
});
