-- Fix security issue: Ensure app_users table requires authentication
-- Add explicit policy to block anonymous access to app_users table

-- Drop existing policy and recreate with explicit auth check
DROP POLICY IF EXISTS app_users_owner_all ON public.app_users;

-- Create policy that explicitly requires authentication AND ownership
CREATE POLICY "app_users_authenticated_owner_only" 
ON public.app_users
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Additional safety: Block all anonymous access explicitly
CREATE POLICY "app_users_block_anonymous" 
ON public.app_users
FOR ALL
TO anon
USING (false);