-- ====== SECURITY FIX: Replace insecure view with secured function-based approach ======

-- Drop the insecure view
DROP VIEW IF EXISTS public.provider_keys_compact;

-- Create a security definer function that enforces user access
CREATE OR REPLACE FUNCTION public.get_provider_keys_compact(requesting_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(user_id UUID, keys JSONB)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    pk.user_id,
    jsonb_object_agg(
      pk.provider, 
      jsonb_build_object(
        'last_tested_at', pk.last_tested_at,
        'last_test_result', pk.last_test_result,
        'scopes', COALESCE(pk.scopes, '{}'::text[])
      )
    ) as keys
  FROM public.provider_keys pk
  WHERE pk.user_id = requesting_user_id  -- Security: only return current user's keys
    AND pk.provider IS NOT NULL
  GROUP BY pk.user_id;
$$;

-- Create a new secure view that uses the function
CREATE VIEW public.provider_keys_compact AS
SELECT * FROM public.get_provider_keys_compact();

-- Enable RLS on the new view (will work because it's backed by the secure function)
ALTER TABLE public.provider_keys_compact ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "provider_keys_compact_user_access" 
ON public.provider_keys_compact 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add security documentation
COMMENT ON FUNCTION public.get_provider_keys_compact IS 'Security definer function that returns provider keys only for the requesting user';
COMMENT ON VIEW public.provider_keys_compact IS 'Secured compatibility view for legacy JSONB provider keys access - enforces user isolation';