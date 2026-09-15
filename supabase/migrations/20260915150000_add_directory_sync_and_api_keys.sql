-- Migration: Add Directory Sync, External IDs, API Keys, and Dynamic Terminology
-- Date: 2026-09-15 15:00:00

-- 1. Add external_id to departments
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Index for idempotent upserting on departments by company and external_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_company_external_id
  ON public.departments(company_id, external_id)
  WHERE external_id IS NOT NULL;

-- 2. Add external_id to hosts
ALTER TABLE public.hosts
  ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Index for idempotent upserting on hosts by company and external_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_hosts_company_external_id
  ON public.hosts(company_id, external_id)
  WHERE external_id IS NOT NULL;

-- 3. Add dynamic terminology columns to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS group_label TEXT DEFAULT 'Department',
  ADD COLUMN IF NOT EXISTS user_label TEXT DEFAULT 'Host';

-- 4. Create api_keys table for secure system-to-system integrations (PMS, ERP, CMS)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast key lookup during API authentication
CREATE INDEX IF NOT EXISTS idx_api_keys_lookup
  ON public.api_keys(key_hash)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_api_keys_company_id
  ON public.api_keys(company_id);

-- 5. Enable RLS on api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Allow company admin to view API keys for their company
DROP POLICY IF EXISTS "Company admins view own api_keys" ON public.api_keys;
CREATE POLICY "Company admins view own api_keys"
  ON public.api_keys
  FOR SELECT
  TO authenticated
  USING (
    company_id = public.get_user_company_id()
    OR public.get_user_role() IN ('super_admin'::public.user_role, 'superadmin'::public.user_role)
  );

-- Allow company admin to create API keys for their company
DROP POLICY IF EXISTS "Company admins insert own api_keys" ON public.api_keys;
CREATE POLICY "Company admins insert own api_keys"
  ON public.api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = public.get_user_company_id()
    OR public.get_user_role() IN ('super_admin'::public.user_role, 'superadmin'::public.user_role)
  );

-- Allow company admin to update/delete own api_keys
DROP POLICY IF EXISTS "Company admins update own api_keys" ON public.api_keys;
CREATE POLICY "Company admins update own api_keys"
  ON public.api_keys
  FOR UPDATE
  TO authenticated
  USING (
    company_id = public.get_user_company_id()
    OR public.get_user_role() IN ('super_admin'::public.user_role, 'superadmin'::public.user_role)
  );

DROP POLICY IF EXISTS "Company admins delete own api_keys" ON public.api_keys;
CREATE POLICY "Company admins delete own api_keys"
  ON public.api_keys
  FOR DELETE
  TO authenticated
  USING (
    company_id = public.get_user_company_id()
    OR public.get_user_role() IN ('super_admin'::public.user_role, 'superadmin'::public.user_role)
  );

-- 6. Grant table permissions
GRANT ALL ON TABLE public.api_keys TO authenticated;
GRANT ALL ON TABLE public.api_keys TO service_role;

