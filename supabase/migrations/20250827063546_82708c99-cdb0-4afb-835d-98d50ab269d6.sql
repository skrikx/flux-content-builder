-- Create provider_keys table for per-user API key storage
CREATE TABLE IF NOT EXISTS public.provider_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  keys JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.provider_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user access
CREATE POLICY "provider_keys_user_rw" ON public.provider_keys
  FOR ALL USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_keys_updated_at
  BEFORE UPDATE ON public.provider_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure content-assets storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-assets', 'content-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for content-assets
CREATE POLICY "content_assets_authenticated_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-assets');

CREATE POLICY "content_assets_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "content_assets_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'content-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "content_assets_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content-assets' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );