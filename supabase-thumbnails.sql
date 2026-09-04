-- 1. Create a new public bucket for thumbnails
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

-- 2. Drop existing policies to be safe for re-runs
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public users can view thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can insert thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete thumbnails" ON storage.objects;
END $$;

-- 3. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies using public.is_admin()
-- Allow anyone to view files in the 'thumbnails' bucket
CREATE POLICY "Public users can view thumbnails" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'thumbnails');

-- Allow admins to insert files into the 'thumbnails' bucket
CREATE POLICY "Admins can insert thumbnails" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'thumbnails' AND 
    public.is_admin()
);

-- Allow admins to update files in the 'thumbnails' bucket
CREATE POLICY "Admins can update thumbnails" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'thumbnails' AND 
    public.is_admin()
);

-- Allow admins to delete files in the 'thumbnails' bucket
CREATE POLICY "Admins can delete thumbnails" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'thumbnails' AND 
    public.is_admin()
);
