-- Add bilingual logo columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS logo_en_url TEXT,
ADD COLUMN IF NOT EXISTS logo_ar_url TEXT;
