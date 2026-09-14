-- Add must_change_password column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.must_change_password IS 'Flag requiring user (e.g. newly provisioned host) to change password on first login';

