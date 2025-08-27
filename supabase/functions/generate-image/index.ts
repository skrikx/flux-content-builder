import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';
import { extractToken, supabaseAuthed, getUserFromToken } from "../_auth_util.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS') || '*',
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
    openai: userKeys.openai || Deno.env.get('OPENAI_API_KEY'),
    huggingface: userKeys.huggingface || Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'),
    unsplash: userKeys.unsplash || Deno.env.get('UNSPLASH_ACCESS_KEY'),
  };
}

async function uploadToStorage(supabase: any, userId: string, imageData: string, isBase64: boolean = false): Promise<string> {
  try {
    let blob: Blob;
    if (isBase64) {
      // Convert base64 to blob
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      blob = new Blob([byteArray], { type: 'image/png' });
    } else {
      // Fetch from URL
      const response = await fetch(imageData);
      blob = await response.blob();
    }
    
    const fileName = `gen/${userId}/images/${Date.now()}.png`;
    
    const { data, error } = await supabase.storage
      .from('content-assets')
      .upload(fileName, blob);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('content-assets')
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Storage upload failed:', error);
    return imageData; // Fallback to original
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
    const { prompt, brand_id } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve API keys with per-user priority
    const keys = await resolveKeys(supabase, user.id);
    
    let imageUrl: string | null = null;
    let provider = 'none';

    // Try Hugging Face first if key available
    if (keys.huggingface) {
      try {
        const hf = new HfInference(keys.huggingface);
        const image = await hf.textToImage({
          inputs: prompt,
          model: 'black-forest-labs/FLUX.1-schnell',
        });
        
        const arrayBuffer = await image.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const chunks = [];
        for (let i = 0; i < uint8Array.length; i += 8192) {
          chunks.push(String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + 8192))));
        }
        const base64 = btoa(chunks.join(''));
        imageUrl = `data:image/png;base64,${base64}`;
        provider = 'huggingface';
      } catch (error) {
        console.log('HuggingFace failed:', error.message);
      }
    }

    // Fallback to OpenAI if HF failed
    if (!imageUrl && keys.openai) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keys.openai}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'auto',
            output_format: 'png'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data[0].url;
          provider = 'openai';
        }
      } catch (error) {
        console.log('OpenAI failed:', error.message);
      }
    }

    // Fallback to Unsplash search if available
    if (!imageUrl && keys.unsplash) {
      try {
        const searchResponse = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt)}&per_page=1`, {
          headers: { 'Authorization': `Client-ID ${keys.unsplash}` }
        });
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.results && searchData.results.length > 0) {
            imageUrl = searchData.results[0].urls.regular;
            provider = 'unsplash';
          }
        }
      } catch (error) {
        console.log('Unsplash search failed:', error.message);
      }
    }

    // Final fallback to Lexica search (no key required)
    if (!imageUrl) {
      try {
        const searchResponse = await fetch(`https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.images && searchData.images.length > 0) {
            imageUrl = searchData.images[0].src;
            provider = 'lexica';
          }
        }
      } catch (error) {
        console.log('Lexica search failed:', error.message);
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate image with all providers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload to storage if it's from AI providers
    let finalUrl = imageUrl;
    if (provider === 'huggingface' || provider === 'openai') {
      finalUrl = await uploadToStorage(supabase, user.id, imageUrl, true);
    } else if (provider === 'unsplash') {
      finalUrl = await uploadToStorage(supabase, user.id, imageUrl, false);
    }

    // Create content record
    const contentId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('content')
      .insert({
        id: contentId,
        user_id: user.id,
        brand_id: brand_id || crypto.randomUUID(),
        type: 'image',
        title: `Generated: ${prompt.slice(0, 50)}...`,
        data: { url: finalUrl, prompt, provider },
        status: 'ready'
      });

    if (insertError) {
      console.error('Failed to save content:', insertError);
    }

    const result = {
      ok: true,
      provider,
      id: contentId,
      title: `Generated: ${prompt.slice(0, 50)}...`,
      created_at: new Date().toISOString(),
      data: { url: finalUrl, prompt, provider },
      meta: { size: '1024x1024', format: 'PNG' }
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-image:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
