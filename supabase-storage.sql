-- 1. Create a new public bucket for videos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- 2. Create Security Definer Function for checking admin role
-- This avoids recursive RLS issues when querying user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 3. Drop existing policies to be safe for re-runs
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public users can view videos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can insert videos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update videos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete videos" ON storage.objects;
    
    DROP POLICY IF EXISTS "Public users can view logos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage logos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can insert logos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update logos" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete logos" ON storage.objects;
    
    DROP POLICY IF EXISTS "Public users can view avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can insert avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete avatars" ON storage.objects;
    
    DROP POLICY IF EXISTS "Public users can view thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can manage thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can insert thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can update thumbnails" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can delete thumbnails" ON storage.objects;
END $$;

-- 4. Enable RLS on storage.objects if not already enabled
-- Note: Supabase handles RLS on storage.objects internally, but this is safe if left.
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Create new buckets for logos, avatars, and thumbnails
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true), ('avatars', 'avatars', true), ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

-- 6. Create Security Policies using the helper function
-- Allow anyone to view files in the public buckets
CREATE POLICY "Public users can view videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Public users can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Public users can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Public users can view thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');

-- VIDEOS Bucket Admin Policies
CREATE POLICY "Admins can insert videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND public.is_admin());
CREATE POLICY "Admins can update videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND public.is_admin());
CREATE POLICY "Admins can delete videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND public.is_admin());

-- LOGOS Bucket Admin Policies
CREATE POLICY "Admins can insert logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos' AND public.is_admin());
CREATE POLICY "Admins can update logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'logos' AND public.is_admin());
CREATE POLICY "Admins can delete logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'logos' AND public.is_admin());

-- AVATARS Bucket Admin Policies
CREATE POLICY "Admins can insert avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND public.is_admin());
CREATE POLICY "Admins can update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND public.is_admin());
CREATE POLICY "Admins can delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND public.is_admin());

-- THUMBNAILS Bucket Admin Policies
CREATE POLICY "Admins can insert thumbnails" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails' AND public.is_admin());
CREATE POLICY "Admins can update thumbnails" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails' AND public.is_admin());
CREATE POLICY "Admins can delete thumbnails" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'thumbnails' AND public.is_admin());
