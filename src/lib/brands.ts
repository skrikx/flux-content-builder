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
  console.log('[Brands] Auth header - session exists:', !!session, 'jwt exists:', !!jwt);
  if (!jwt) {
    console.warn('[Brands] No JWT token found in session');
  }
  return jwt ? { Authorization: `Bearer ${jwt}` } : {}
}

export async function createOrUpdateBrand(input: BrandInput) {
  console.log('[Brands] Creating brand:', input.name);
  const headers = await authHeader()
  console.log('[Brands] Using headers:', headers);
  
  const { data, error } = await supabase.functions.invoke("brands", {
    method: "POST",
    body: input,
    headers
  })
  
  console.log('[Brands] Response:', { data, error });
  if (error) {
    console.error('[Brands] Create failed:', error);
    throw new Error(error.message)
  }
  if (!data?.id) throw new Error("Brand not created (empty response)")
  return data
}

export async function getBrands() {
  console.log('[Brands] Fetching brands...');
  const headers = await authHeader()
  const { data, error } = await supabase.functions.invoke("brands", {
    method: "GET",
    headers
  })
  
  console.log('[Brands] Fetch response:', { data, error });
  if (error) {
    console.error('[Brands] Fetch failed:', error);
    throw new Error(error.message)
  }
  return data || []
}