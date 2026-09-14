-- 1. Add logo_url column to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create company-assets bucket if it does not exist (public read, 2MB size limit, allowed MIME types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,
  2097152, -- 2MB (2 * 1024 * 1024 bytes)
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Set up storage policies for company-assets bucket
-- Allow public read access to all assets in company-assets
DROP POLICY IF EXISTS "Public Read company-assets" ON storage.objects;
CREATE POLICY "Public Read company-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-assets');

-- Allow authenticated users to upload/insert into company-assets
DROP POLICY IF EXISTS "Authenticated Insert company-assets" ON storage.objects;
CREATE POLICY "Authenticated Insert company-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-assets');

-- Allow authenticated users to update/overwrite objects in company-assets
DROP POLICY IF EXISTS "Authenticated Update company-assets" ON storage.objects;
CREATE POLICY "Authenticated Update company-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-assets')
WITH CHECK (bucket_id = 'company-assets');

-- Allow authenticated users to delete objects in company-assets
DROP POLICY IF EXISTS "Authenticated Delete company-assets" ON storage.objects;
CREATE POLICY "Authenticated Delete company-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-assets');

