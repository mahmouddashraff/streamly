-- Schema for Streamly (V2)

-- 1. User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: We must add the foreign key manually to auth.users in a way that is safe if it doesn't exist in local testing environments without auth schema, but in Supabase, auth.users exists.
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;


-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Videos Table (Standalone movies or one-off videos)
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    category TEXT REFERENCES public.categories(name) ON DELETE SET NULL,
    year INTEGER NOT NULL,
    duration TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('movie', 'episode')),
    video_url TEXT NOT NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    podcast_id UUID REFERENCES public.podcasts(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.guests(id) ON DELETE CASCADE,
    presenter_id UUID REFERENCES public.presenters(id) ON DELETE CASCADE,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Series Table
CREATE TABLE IF NOT EXISTS public.series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT REFERENCES public.categories(name) ON DELETE SET NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Episodes Table
CREATE TABLE IF NOT EXISTS public.episodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    episode_number INTEGER NOT NULL,
    season_number INTEGER NOT NULL,
    duration TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    video_url TEXT NOT NULL,
    published BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to make the script idempotent
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "User roles viewable by admins" ON public.user_roles;
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
    DROP POLICY IF EXISTS "Categories can be managed by admins" ON public.categories;
    DROP POLICY IF EXISTS "Videos are viewable by everyone if published" ON public.videos;
    DROP POLICY IF EXISTS "Videos can be managed by admins" ON public.videos;
    DROP POLICY IF EXISTS "Series are viewable by everyone if published" ON public.series;
    DROP POLICY IF EXISTS "Series can be managed by admins" ON public.series;
    DROP POLICY IF EXISTS "Episodes are viewable by everyone if published" ON public.episodes;
    DROP POLICY IF EXISTS "Episodes can be managed by admins" ON public.episodes;
END $$;

-- --------------------------------------------------------
-- USER ROLES POLICIES
-- --------------------------------------------------------
CREATE POLICY "User roles viewable by admins" 
ON public.user_roles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------------------
-- CATEGORIES POLICIES
-- --------------------------------------------------------
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Categories can be managed by admins" 
ON public.categories FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------------------
-- VIDEOS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Videos are viewable by everyone if published" 
ON public.videos FOR SELECT 
USING (
    published = true 
    OR 
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Videos can be managed by admins" 
ON public.videos FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------------------
-- SERIES POLICIES
-- --------------------------------------------------------
CREATE POLICY "Series are viewable by everyone if published" 
ON public.series FOR SELECT 
USING (
    published = true 
    OR 
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Series can be managed by admins" 
ON public.series FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------------------
-- EPISODES POLICIES
-- --------------------------------------------------------
CREATE POLICY "Episodes are viewable by everyone if published" 
ON public.episodes FOR SELECT 
USING (
    published = true 
    OR 
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Episodes can be managed by admins" 
ON public.episodes FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- --------------------------------------------------------
-- NEW TABLES (PODCASTS, CHANNELS, GUESTS, PRESENTERS, USER_LISTS)
-- --------------------------------------------------------

-- 6. Podcasts Table
CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    video_url TEXT,
    episode_number INTEGER,
    duration TEXT,
    release_date TIMESTAMPTZ,
    guest_id UUID,
    presenter_id UUID,
    published BOOLEAN DEFAULT false NOT NULL,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Channels Table
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Presenters Table
CREATE TABLE IF NOT EXISTS public.presenters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    is_soon BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. User Lists Table (My List)
CREATE TABLE IF NOT EXISTS public.user_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('video', 'podcast')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, content_id)
);

-- Enable RLS for new tables
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presenters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to make script idempotent
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Podcasts are viewable by everyone if published" ON public.podcasts;
    DROP POLICY IF EXISTS "Podcasts can be managed by admins" ON public.podcasts;
    DROP POLICY IF EXISTS "Channels are viewable by everyone" ON public.channels;
    DROP POLICY IF EXISTS "Channels can be managed by admins" ON public.channels;
    DROP POLICY IF EXISTS "Guests are viewable by everyone" ON public.guests;
    DROP POLICY IF EXISTS "Guests can be managed by admins" ON public.guests;
    DROP POLICY IF EXISTS "Presenters are viewable by everyone" ON public.presenters;
    DROP POLICY IF EXISTS "Presenters can be managed by admins" ON public.presenters;
    DROP POLICY IF EXISTS "Users can manage their own lists" ON public.user_lists;
END $$;

-- Policies
CREATE POLICY "Podcasts are viewable by everyone if published" ON public.podcasts FOR SELECT USING (published = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Podcasts can be managed by admins" ON public.podcasts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Channels are viewable by everyone" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Channels can be managed by admins" ON public.channels FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Guests are viewable by everyone" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Guests can be managed by admins" ON public.guests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Presenters are viewable by everyone" ON public.presenters FOR SELECT USING (true);
CREATE POLICY "Presenters can be managed by admins" ON public.presenters FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can manage their own lists" ON public.user_lists FOR ALL TO authenticated USING (user_id = auth.uid());
