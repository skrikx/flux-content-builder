import { supabase } from "@/integrations/supabase/client"

export type BrandInput = {
  name: string
  voice?: string
  tone?: string
  style?: Record<string, unknown>
  assets?: Record<string, unknown>
}

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  const jwt = session?.access_token
  return jwt ? { Authorization: `Bearer ${jwt}` } : {}
}

export async function createOrUpdateBrand(input: BrandInput) {
  const headers = await authHeader()
  const { data, error } = await supabase.functions.invoke("brands", {
    method: "POST",
    body: input,
    headers
  })
  if (error) throw new Error(error.message)
  if (!data?.id) throw new Error("Brand not created (empty response)")
  return data
}

export async function getBrands() {
  const headers = await authHeader()
  const { data, error } = await supabase.functions.invoke("brands", {
    method: "GET",
    headers
  })
  if (error) throw new Error(error.message)
  return data
}