-- Add is_soon to parent entities
ALTER TABLE public.presenters ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;

-- To force the schema cache to refresh, we can run this (Supabase handles it automatically for table alters, but just to be sure):
NOTIFY pgrst, 'reload schema';
