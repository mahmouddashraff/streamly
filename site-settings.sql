-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'STREAMLY',
    site_name_en TEXT DEFAULT 'watch today''s events',
    site_name_ar TEXT DEFAULT 'شاهد الحدث اليوم',
    site_description TEXT DEFAULT 'Premium Streaming Platform',
    site_logo_url TEXT,
    logo_en_url TEXT,
    logo_ar_url TEXT,
    default_language TEXT DEFAULT 'ar',
    social_facebook TEXT,
    social_instagram TEXT,
    social_youtube TEXT,
    social_tiktok TEXT,
    social_twitter TEXT,
    hero_background_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for site_settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Allow admins to update settings
CREATE POLICY "Allow admins to insert site_settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Allow admins to update site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- Insert default row if not exists
INSERT INTO public.site_settings (id, site_name, site_name_en, site_name_ar, site_description, default_language)
VALUES (1, 'STREAMLY', 'watch today''s events', 'شاهد الحدث اليوم', 'Premium Streaming Platform', 'ar')
ON CONFLICT (id) DO NOTHING;
