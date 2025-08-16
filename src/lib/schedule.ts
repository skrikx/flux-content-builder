import { supabase } from "@/integrations/supabase/client"

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  const jwt = session?.access_token
  return jwt ? { Authorization: `Bearer ${jwt}` } : {}
}

export async function createSchedule(contentId: string, platform: "buffer" | "webhook", whenISO: string, meta?: any) {
  const headers = await authHeader()
  const { data, error } = await supabase.functions.invoke("schedule", {
    method: "POST",
    body: { content_id: contentId, platform, publish_time: whenISO, meta },
    headers
  })
  if (error) throw new Error(error.message)
  return data
}

export async function listSchedules() {
  const headers = await authHeader()
  const { data, error } = await supabase.functions.invoke("schedule", { method: "GET", headers })
  if (error) throw new Error(error.message)
  return data
}