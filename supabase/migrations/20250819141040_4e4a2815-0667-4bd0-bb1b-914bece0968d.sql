-- Fix column reference mismatch between publish_at and publish_time
-- The schedules table has publish_time but code is using publish_at
-- We need to standardize on publish_time (as that's what exists)

-- No actual schema change needed, just fixing the code to use correct column name