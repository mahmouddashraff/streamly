-- V2 Platform Upgrade Schema
-- This script creates the new entities required for Podcasts, Channels, Guests, Presenters, and User Lists.
-- It is designed to be non-destructive to existing tables.

-- 1. Guests
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Presenters
CREATE TABLE IF NOT EXISTS public.presenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Channels
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Podcasts
CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    video_url TEXT NOT NULL,
    episode_number INTEGER,
    duration TEXT,
    release_date DATE,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    presenter_id UUID REFERENCES public.presenters(id) ON DELETE SET NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. User Lists (My List)
CREATE TABLE IF NOT EXISTS public.user_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL, -- Generic UUID to support videos or podcasts
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'podcast')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_id) -- Prevent duplicate saves
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- PUBLIC READ POLICIES
-- --------------------------------------------------------
CREATE POLICY "Guests are viewable by everyone" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Presenters are viewable by everyone" ON public.presenters FOR SELECT USING (true);
CREATE POLICY "Channels are viewable by everyone" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Podcasts viewable if published" ON public.podcasts FOR SELECT USING (published = true);

-- --------------------------------------------------------
-- ADMIN WRITE POLICIES
-- --------------------------------------------------------
CREATE POLICY "Admins can manage guests" ON public.guests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage presenters" ON public.presenters FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage podcasts" ON public.podcasts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view all podcasts" ON public.podcasts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- --------------------------------------------------------
-- USER LISTS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Users can view their own lists" ON public.user_lists FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own lists" ON public.user_lists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own lists" ON public.user_lists FOR DELETE TO authenticated USING (auth.uid() = user_id);
