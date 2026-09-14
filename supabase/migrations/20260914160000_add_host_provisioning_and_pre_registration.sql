-- 1. Ensure 'host' exists in user_role enum for profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'host';
  END IF;
END $$;

-- 2. Update visit_status ENUM to include 'pre_registered' and 'cancelled'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_status') THEN
    ALTER TYPE public.visit_status ADD VALUE IF NOT EXISTS 'pre_registered';
    ALTER TYPE public.visit_status ADD VALUE IF NOT EXISTS 'cancelled';
  END IF;
END $$;

-- 3. Drop any legacy status check constraints if present on visitors
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.visitors'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.visitors DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 4. Add pre-registration columns to visitors table
ALTER TABLE public.visitors
  ADD COLUMN IF NOT EXISTS expected_arrival TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_pre_registered BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pre_registered_by UUID REFERENCES public.hosts(id) ON DELETE SET NULL;

-- 5. Add user_id to hosts table to link directly to auth.users
ALTER TABLE public.hosts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. Add index on visitors(company_id, status, expected_arrival)
CREATE INDEX IF NOT EXISTS idx_visitors_company_status_expected_arrival
  ON public.visitors(company_id, status, expected_arrival);

-- 7. Update RLS policy to allow pre_registered status insertion
DROP POLICY IF EXISTS "Visitors authenticated company insert" ON public.visitors;
CREATE POLICY "Visitors authenticated company insert"
ON public.visitors
FOR INSERT
TO authenticated
WITH CHECK (
  status::text IN ('pending', 'pre_registered')
  AND (
    company_id = public.get_user_company_id()
    OR public.get_user_role() IN ('super_admin'::public.user_role, 'superadmin'::public.user_role)
  )
  AND (
    gate_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.gates
      WHERE gates.id = visitors.gate_id
        AND gates.company_id = visitors.company_id
    )
  )
  AND (
    host_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.hosts
      WHERE hosts.id = visitors.host_id
        AND hosts.company_id = visitors.company_id
    )
  )
);

