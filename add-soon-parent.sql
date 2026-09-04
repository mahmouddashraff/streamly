-- Migration: Convert Soon into Parent Entity

-- 1. Create soon table
CREATE TABLE IF NOT EXISTS public.soon (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    title_en TEXT,
    title_ar TEXT,
    description_en TEXT,
    description_ar TEXT,
    published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add foreign key to videos table
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS soon_id UUID REFERENCES public.soon(id) ON DELETE CASCADE;

-- 3. Enable RLS
ALTER TABLE public.soon ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (idempotency)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Soon are viewable by everyone if published" ON public.soon;
    DROP POLICY IF EXISTS "Soon can be managed by admins" ON public.soon;
END $$;

-- 5. Add RLS Policies
CREATE POLICY "Soon are viewable by everyone if published" 
ON public.soon FOR SELECT 
USING (published = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Soon can be managed by admins" 
ON public.soon FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Note: We are leaving the is_soon boolean column on videos intact to avoid breaking any legacy views that depend on it until fully migrated.

NOTIFY pgrst, 'reload schema';
