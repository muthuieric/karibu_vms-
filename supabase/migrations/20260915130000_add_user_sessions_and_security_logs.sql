-- Add is_compromised column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_compromised BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.profiles.is_compromised IS 'Flag indicating account has been flagged for suspicious security activity (e.g. impossible travel)';

-- Create user_sessions table for tracking logins and detecting impossible travel
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  user_agent TEXT,
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index user sessions by user and time for quick latest-session retrieval
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_created 
ON public.user_sessions (user_id, created_at DESC);

-- Index for monitoring suspicious activity
CREATE INDEX IF NOT EXISTS idx_user_sessions_suspicious 
ON public.user_sessions (is_suspicious) WHERE is_suspicious = true;

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own session history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'Users can view their own sessions'
  ) THEN
    CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

