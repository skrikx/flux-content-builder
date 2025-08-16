import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function genImageFree(prompt: string, path: string) {
  const url = Deno.env.get('OSS_IMG_URL')
  
  if (!url) {
    throw new Error('OSS_IMG_URL not configured')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt })
  })

  if (!response.ok) {
    throw new Error(`OSS IMG error ${response.status}`)
  }

  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data, error } = await supabase.storage
    .from('content-assets')
    .upload(path, uint8Array, {
      contentType: 'image/png',
      upsert: true
    })

  if (error) throw error

  const { data: publicUrl } = supabase.storage
    .from('content-assets')
    .getPublicUrl(path)

  return publicUrl.publicUrl
}

async function genImagePremium(prompt: string, path: string) {
  const key = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('STABILITY_API_KEY')
  
  if (!key) {
    throw new Error('No premium image key configured')
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024'
    })
  })

  if (!response.ok) {
    throw new Error(`Premium IMG error ${response.status}`)
  }

  const data = await response.json()
  const img = data.data[0].b64_json
  const uint8Array = new Uint8Array(atob(img).split('').map(char => char.charCodeAt(0)))

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: uploadData, error } = await supabase.storage
    .from('content-assets')
    .upload(path, uint8Array, {
      contentType: 'image/png',
      upsert: true
    })

  if (error) throw error

  const { data: publicUrl } = supabase.storage
    .from('content-assets')
    .getPublicUrl(path)

  return publicUrl.publicUrl
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { brand_id, mode = 'free', prompt, width = 1024, height = 1024 } = await req.json()

    if (!brand_id || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const key = crypto.randomUUID()
    const path = `${user.id}/images/${key}.png`

    let publicUrl: string
    let note: string | undefined
    
    // Check if SERVICE_ROLE_KEY is available for file uploads
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    if (!serviceKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - using placeholder')
      publicUrl = `https://via.placeholder.com/${width}x${height}/4338ca/ffffff?text=${encodeURIComponent('Image Generation Unavailable')}`
      note = 'SUPABASE_SERVICE_ROLE_KEY missing - image not uploaded to storage'
    } else {
      try {
        publicUrl = mode === 'premium' 
          ? await genImagePremium(prompt, path)
          : await genImageFree(prompt, path)
      } catch (error) {
        console.error('Image generation error:', error)
        publicUrl = `https://via.placeholder.com/${width}x${height}/4338ca/ffffff?text=${encodeURIComponent('Image Generation Error')}`
        note = `Image generation failed: ${error.message}`
      }
    }

    const { data, error } = await supabaseClient
      .from('content')
      .insert({
        user_id: user.id,
        brand_id,
        type: 'image',
        title: prompt.slice(0, 120),
        data: { 
          url: publicUrl, 
          width, 
          height, 
          prompt,
          provider: mode,
          ...(note && { note })
        }
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-image function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})