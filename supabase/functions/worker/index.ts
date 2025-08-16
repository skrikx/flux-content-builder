import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function publishViaBuffer(text: string, mediaUrl: string | null) {
  const token = Deno.env.get('BUFFER_API_KEY')
  if (!token) throw new Error('BUFFER_API_KEY missing')
  
  const formData = new FormData()
  formData.append('text', text)
  if (mediaUrl) formData.append('media', mediaUrl)

  const response = await fetch('https://api.buffer.com/1/updates/create.json', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${token}` },
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Buffer error ${response.status}`)
  }
}

async function publishViaWebhook(payload: any) {
  const hook = Deno.env.get('GHL_WEBHOOK_URL')
  if (!hook) throw new Error('GHL_WEBHOOK_URL missing')
  
  const response = await fetch(hook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Webhook error ${response.status}`)
  }
}

async function publishRow(row: any, supabase: any) {
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('id', row.content_id)
    .single()

  if (!content) return

  const text = content.data?.markdown || content.title || 'Post'
  const media = content.data?.url || null

  if (row.platform === 'buffer') {
    await publishViaBuffer(text, media)
  } else {
    await publishViaWebhook({
      text,
      media,
      platform: row.platform,
      brand_id: content.brand_id
    })
  }
}

async function tickOnce() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString()
  const { data: due, error } = await supabase
    .from('schedules')
    .select('*')
    .lte('publish_time', now)
    .eq('status', 'pending')
    .limit(10)

  if (error) {
    console.error('Error fetching due schedules:', error)
    return
  }

  console.log(`Processing ${due?.length || 0} due schedules`)

  for (const row of due || []) {
    try {
      await publishRow(row, supabase)
      
      await supabase
        .from('schedules')
        .update({ status: 'posted' })
        .eq('id', row.id)

      await supabase
        .from('content')
        .update({ status: 'published' })
        .eq('id', row.content_id)

      console.log(`Published schedule ${row.id}`)
    } catch (error) {
      console.error(`Failed to publish schedule ${row.id}:`, error)
      
      await supabase
        .from('schedules')
        .update({ 
          status: 'failed', 
          retries: (row.retries || 0) + 1 
        })
        .eq('id', row.id)
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    await tickOnce()
    
    return new Response(
      JSON.stringify({ ok: true, processed_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in worker function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})