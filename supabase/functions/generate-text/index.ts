import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { extractToken, supabaseAuthed, getUserFromToken } from "../_auth_util.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function genTextFree(prompt: string) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not configured for free tier')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

async function genTextPremium(prompt: string) {
  const key = Deno.env.get('OPENAI_API_KEY')
  
  if (!key) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const token = extractToken(req);
    const { data: { user } } = await getUserFromToken(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = supabaseAuthed(token);

    const { brand_id, mode = 'free', kind = 'blog', topic, length = 'medium' } = await req.json()

    if (!brand_id || !topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `Brand aligned ${kind}. Topic: ${topic}. Length: ${length}. Include headline and CTA.`

    let text: string
    try {
      text = mode === 'premium' ? await genTextPremium(prompt) : await genTextFree(prompt)
    } catch (error) {
      console.error('Generation error:', error)
      // Fallback to a simple template
      text = `# ${topic}\n\nThis is a ${kind} about ${topic}. Content generation is currently unavailable, but you can edit this text to create your ${kind}.\n\n**Call to Action:** Get started today!`
    }

    const { data, error } = await supabaseClient
      .from('content')
      .insert({
        user_id: user.id,
        brand_id,
        type: 'text',
        title: topic,
        data: { markdown: text, kind }
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
    console.error('Error in generate-text function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})