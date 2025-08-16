import { invokeWithAuth } from "@/lib/invoke"

export type BrandInput = {
  name: string
  voice?: string
  tone?: string
  style?: Record<string, unknown>
  assets?: Record<string, unknown>
}

export async function createOrUpdateBrand(input: BrandInput) {
  console.log('[Brands] Creating brand:', input.name);
  
  const { data, error } = await invokeWithAuth("brands", {
    method: "POST",
    body: input
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
  const { data, error } = await invokeWithAuth("brands", {
    method: "GET"
  })
  
  console.log('[Brands] Fetch response:', { data, error });
  if (error) {
    console.error('[Brands] Fetch failed:', error);
    throw new Error(error.message)
  }
  return data || []
}