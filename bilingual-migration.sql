-- 1. Videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;

UPDATE public.videos SET title_en = title, title_ar = title WHERE title_en IS NULL;
UPDATE public.videos SET description_en = description, description_ar = description WHERE description_en IS NULL;

-- 2. Series
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;

UPDATE public.series SET title_en = title, title_ar = title WHERE title_en IS NULL;
UPDATE public.series SET description_en = description, description_ar = description WHERE description_en IS NULL;

-- 3. Episodes
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS description_ar TEXT;

UPDATE public.episodes SET title_en = title, title_ar = title WHERE title_en IS NULL;
UPDATE public.episodes SET description_en = description, description_ar = description WHERE description_en IS NULL;

-- 4. Podcasts
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS is_soon BOOLEAN DEFAULT false;

UPDATE public.podcasts SET title_en = title, title_ar = title WHERE title_en IS NULL;
UPDATE public.podcasts SET description_en = description, description_ar = description WHERE description_en IS NULL;

-- 5. Channels
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.channels ADD COLUMN IF NOT EXISTS description_ar TEXT;

UPDATE public.channels SET name_en = name, name_ar = name WHERE name_en IS NULL;
UPDATE public.channels SET description_en = description, description_ar = description WHERE description_en IS NULL;

-- 6. Guests
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS bio_ar TEXT;

UPDATE public.guests SET name_en = name, name_ar = name WHERE name_en IS NULL;
UPDATE public.guests SET bio_en = bio, bio_ar = bio WHERE bio_en IS NULL;

-- 7. Presenters
ALTER TABLE public.presenters ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.presenters ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.presenters ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE public.presenters ADD COLUMN IF NOT EXISTS bio_ar TEXT;

UPDATE public.presenters SET name_en = name, name_ar = name WHERE name_en IS NULL;
UPDATE public.presenters SET bio_en = bio, bio_ar = bio WHERE bio_en IS NULL;

-- 8. Categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ar TEXT;

UPDATE public.categories SET name_en = name, name_ar = name WHERE name_en IS NULL;
