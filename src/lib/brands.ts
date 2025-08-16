import { supabase } from "@/integrations/supabase/client"

export type BrandInput = {
  name: string
  voice?: string
  tone?: string
  style?: Record<string, unknown>
  assets?: Record<string, unknown>
}

export async function createOrUpdateBrand(input: BrandInput) {
  // Minimal payload - backend will attach user_id
  const { data, error } = await supabase.functions.invoke("brands", {
    method: "POST",
    body: input
  })
  if (error) throw new Error(error.message)
  return data
}

export async function getBrands() {
  const { data, error } = await supabase.functions.invoke("brands", { method: "GET" })
  if (error) throw new Error(error.message)
  return data
}