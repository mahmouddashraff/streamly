-- Add bilingual site name columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS site_name_en TEXT,
ADD COLUMN IF NOT EXISTS site_name_ar TEXT;

-- Update the default row if it exists
UPDATE public.site_settings
SET 
  site_name_en = 'watch today''s events',
  site_name_ar = 'شاهد الحدث اليوم'
WHERE id = 1 AND site_name_en IS NULL AND site_name_ar IS NULL;
