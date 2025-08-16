-- Ensure app_users table exists with proper structure
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on app_users
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Ensure user_id column exists on brands table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema='public' AND table_name='brands' AND column_name='user_id') THEN
    ALTER TABLE public.brands ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure all tables have RLS enabled
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ BEGIN
  -- app_users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='app_users' AND policyname='app_users_owner_all') THEN
    CREATE POLICY app_users_owner_all ON public.app_users 
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  
  -- brands policies  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='brands' AND policyname='brands_owner_all') THEN
    CREATE POLICY brands_owner_all ON public.brands 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- content policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='content' AND policyname='content_owner_all') THEN
    CREATE POLICY content_owner_all ON public.content 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- schedules policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='schedules' AND policyname='schedules_owner_all') THEN
    CREATE POLICY schedules_owner_all ON public.schedules 
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;