-- 1. Add media_type column defaulting to 'image' for backward compatibility
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='advertisements' AND column_name='media_type') THEN
        ALTER TABLE advertisements ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image';
    END IF;
END $$;

-- 2. Add CHECK constraint for media_type
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_media_type_check;
ALTER TABLE advertisements ADD CONSTRAINT advertisements_media_type_check CHECK (media_type IN ('image', 'video'));

-- 3. Update the position CHECK constraint to include 'ads_page' (and remove 'header' natively)
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_position_check;
ALTER TABLE advertisements ADD CONSTRAINT advertisements_position_check 
CHECK (position IN ('left', 'right', 'both', 'ads_page'));
