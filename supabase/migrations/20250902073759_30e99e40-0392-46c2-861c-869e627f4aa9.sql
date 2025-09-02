-- ====== SECURITY FIX: Replace insecure view with proper secured table ======

-- Drop the problematic view entirely
DROP VIEW IF EXISTS public.provider_keys_compact;

-- Create a properly secured replacement table for compatibility
CREATE TABLE IF NOT EXISTS public.provider_keys_compact (
  user_id UUID NOT NULL,
  keys JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Enable RLS on the table
ALTER TABLE public.provider_keys_compact ENABLE ROW LEVEL SECURITY;

-- Create strict RLS policies
CREATE POLICY "provider_keys_compact_user_select" 
ON public.provider_keys_compact 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "provider_keys_compact_user_insert" 
ON public.provider_keys_compact 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "provider_keys_compact_user_update" 
ON public.provider_keys_compact 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "provider_keys_compact_user_delete" 
ON public.provider_keys_compact 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to sync data from provider_keys to provider_keys_compact
CREATE OR REPLACE FUNCTION public.sync_provider_keys_compact()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.provider_keys_compact (user_id, keys, updated_at)
  SELECT 
    pk.user_id,
    jsonb_object_agg(
      pk.provider, 
      jsonb_build_object(
        'last_tested_at', pk.last_tested_at,
        'last_test_result', pk.last_test_result,
        'scopes', COALESCE(pk.scopes, '{}'::text[])
      )
    ) as keys,
    now()
  FROM public.provider_keys pk
  WHERE pk.user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND pk.provider IS NOT NULL
  GROUP BY pk.user_id
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    keys = EXCLUDED.keys,
    updated_at = EXCLUDED.updated_at;
    
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to keep the compact table in sync
DROP TRIGGER IF EXISTS trg_sync_provider_keys_compact_insert ON public.provider_keys;
DROP TRIGGER IF EXISTS trg_sync_provider_keys_compact_update ON public.provider_keys;
DROP TRIGGER IF EXISTS trg_sync_provider_keys_compact_delete ON public.provider_keys;

CREATE TRIGGER trg_sync_provider_keys_compact_insert
  AFTER INSERT ON public.provider_keys
  FOR EACH ROW EXECUTE FUNCTION public.sync_provider_keys_compact();

CREATE TRIGGER trg_sync_provider_keys_compact_update
  AFTER UPDATE ON public.provider_keys
  FOR EACH ROW EXECUTE FUNCTION public.sync_provider_keys_compact();

CREATE TRIGGER trg_sync_provider_keys_compact_delete
  AFTER DELETE ON public.provider_keys
  FOR EACH ROW EXECUTE FUNCTION public.sync_provider_keys_compact();

-- Populate initial data
INSERT INTO public.provider_keys_compact (user_id, keys, updated_at)
SELECT 
  pk.user_id,
  jsonb_object_agg(
    pk.provider, 
    jsonb_build_object(
      'last_tested_at', pk.last_tested_at,
      'last_test_result', pk.last_test_result,
      'scopes', COALESCE(pk.scopes, '{}'::text[])
    )
  ) as keys,
  now()
FROM public.provider_keys pk
WHERE pk.provider IS NOT NULL
GROUP BY pk.user_id
ON CONFLICT (user_id) DO NOTHING;