-- 1. Add price column to videos table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='videos' AND column_name='price') THEN
        ALTER TABLE videos ADD COLUMN price NUMERIC(10,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Create video_access_requests table
CREATE TABLE IF NOT EXISTS video_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure a user can only have one pending request per video
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_video_pending_request ON video_access_requests(user_id, video_id) WHERE status = 'pending';

-- 3. Create video_access_grants table
CREATE TABLE IF NOT EXISTS video_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.video_access_requests(id) ON DELETE SET NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NULL,
    revoked_at TIMESTAMPTZ NULL
);

-- Ensure a user can only have one active grant per video
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_video_active_grant ON video_access_grants(user_id, video_id) WHERE revoked_at IS NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE video_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_access_grants ENABLE ROW LEVEL SECURITY;

-- 5. Drop insecure/obsolete policies if they exist (just in case they were partially run)
DROP POLICY IF EXISTS "Users can insert their own requests" ON video_access_requests;
DROP POLICY IF EXISTS "Users can view secure_videos if they have a grant" ON storage.objects;

-- 6. RLS Policies for video_access_requests
-- Users can only view their own requests. Admins can view all.
DROP POLICY IF EXISTS "Users can view their own requests" ON video_access_requests;
CREATE POLICY "Users can view their own requests"
ON video_access_requests FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- Notice: NO INSERT POLICY for regular users. 
-- The server will use the SERVICE_ROLE_KEY to insert securely.

DROP POLICY IF EXISTS "Admins can update requests" ON video_access_requests;
CREATE POLICY "Admins can update requests"
ON video_access_requests FOR UPDATE
USING (public.is_admin());

-- 7. RLS Policies for video_access_grants
DROP POLICY IF EXISTS "Users can view their own grants" ON video_access_grants;
CREATE POLICY "Users can view their own grants"
ON video_access_grants FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert grants" ON video_access_grants;
CREATE POLICY "Admins can insert grants"
ON video_access_grants FOR INSERT
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update grants" ON video_access_grants;
CREATE POLICY "Admins can update grants"
ON video_access_grants FOR UPDATE
USING (public.is_admin());

-- 8. Trigger to update updated_at timestamp on requests
CREATE OR REPLACE FUNCTION update_video_access_requests_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_video_access_requests_updated_at ON video_access_requests;
CREATE TRIGGER update_video_access_requests_updated_at
    BEFORE UPDATE ON video_access_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_video_access_requests_updated_at_column();

-- 9. Storage Policies for secure_videos
-- Important: Go to Supabase Dashboard -> Storage -> Create a new bucket named "secure_videos"
-- Important: Do NOT make it public. Keep the "Public" toggle OFF.

-- Admins have full access to manage the secure bucket
DROP POLICY IF EXISTS "Admins have full access to secure_videos" ON storage.objects;
CREATE POLICY "Admins have full access to secure_videos" 
ON storage.objects FOR ALL 
USING (bucket_id = 'secure_videos' AND public.is_admin());

-- Notice: NO SELECT POLICY for regular users on secure_videos.
-- The server will use the SERVICE_ROLE_KEY to generate Signed URLs securely.
