-- Migration: Create soon_images table for Soon Image Posts

-- 1. Create soon_images table
CREATE TABLE IF NOT EXISTS public.soon_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    soon_id UUID NOT NULL REFERENCES public.soon(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    title_en TEXT,
    title_ar TEXT,
    description_en TEXT,
    description_ar TEXT,
    image_url TEXT NOT NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.soon_images ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (idempotency)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Soon images are viewable by everyone if published" ON public.soon_images;
    DROP POLICY IF EXISTS "Soon images can be managed by admins" ON public.soon_images;
END $$;

-- 4. Add RLS Policies
CREATE POLICY "Soon images are viewable by everyone if published" 
ON public.soon_images FOR SELECT 
USING (published = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Soon images can be managed by admins" 
ON public.soon_images FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
