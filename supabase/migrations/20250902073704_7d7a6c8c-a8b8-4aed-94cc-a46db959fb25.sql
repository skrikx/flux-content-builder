-- ====== SECURITY FIX: Enable RLS on provider_keys_compact view ======

-- Enable row level security on the view
ALTER VIEW public.provider_keys_compact SET (security_barrier = on);
ALTER TABLE public.provider_keys_compact ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure users can only see their own keys
CREATE POLICY "provider_keys_compact_user_access" 
ON public.provider_keys_compact 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON VIEW public.provider_keys_compact IS 'Compatibility view for legacy JSONB provider keys access - secured with RLS';