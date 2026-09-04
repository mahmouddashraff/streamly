-- Migration: Convert Exclusives and Today's Events into Parent Entities

-- 1. Create exclusives table
CREATE TABLE IF NOT EXISTS public.exclusives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    title_en TEXT,
    title_ar TEXT,
    description_en TEXT,
    description_ar TEXT,
    published BOOLEAN DEFAULT false NOT NULL,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create todays_events table
CREATE TABLE IF NOT EXISTS public.todays_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    title_en TEXT,
    title_ar TEXT,
    description_en TEXT,
    description_ar TEXT,
    published BOOLEAN DEFAULT false NOT NULL,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add foreign keys to videos table
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS exclusive_id UUID REFERENCES public.exclusives(id) ON DELETE CASCADE;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS todays_event_id UUID REFERENCES public.todays_events(id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE public.exclusives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todays_events ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies (idempotency)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Exclusives are viewable by everyone if published" ON public.exclusives;
    DROP POLICY IF EXISTS "Exclusives can be managed by admins" ON public.exclusives;
    DROP POLICY IF EXISTS "Todays Events are viewable by everyone if published" ON public.todays_events;
    DROP POLICY IF EXISTS "Todays Events can be managed by admins" ON public.todays_events;
END $$;

-- 6. Add RLS Policies
CREATE POLICY "Exclusives are viewable by everyone if published" 
ON public.exclusives FOR SELECT 
USING (published = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Exclusives can be managed by admins" 
ON public.exclusives FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));


CREATE POLICY "Todays Events are viewable by everyone if published" 
ON public.todays_events FOR SELECT 
USING (published = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Todays Events can be managed by admins" 
ON public.todays_events FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
