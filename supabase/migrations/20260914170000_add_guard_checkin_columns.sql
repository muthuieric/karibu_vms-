-- Add check_in_time and guard_id to visitors table
ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS guard_id UUID;

