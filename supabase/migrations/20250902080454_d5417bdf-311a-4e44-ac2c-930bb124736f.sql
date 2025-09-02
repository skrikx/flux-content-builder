-- ====== SECURITY ENHANCEMENT: Database Function Hardening ======

-- Fix search_path security for existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public
SECURITY DEFINER;

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
$$ LANGUAGE plpgsql 
SET search_path = public
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_content_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.event_log(user_id, brand_id, event_type, ref_table, ref_id, payload)
  VALUES (NEW.user_id, NEW.brand_id, 'content.generated', 'content', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_research_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.event_log(user_id, brand_id, event_type, ref_table, ref_id, payload)
  VALUES (NEW.user_id, NEW.brand_id, 'research.completed', 'research_runs', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public
SECURITY DEFINER;