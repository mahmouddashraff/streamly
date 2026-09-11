-- 1. Safely add the column with a default value of 'link' for existing records
ALTER TABLE advertisements 
ADD COLUMN IF NOT EXISTS click_behavior TEXT NOT NULL DEFAULT 'link';

-- 2. Safely drop the check constraint if it already exists (ensures script is idempotent)
ALTER TABLE advertisements 
DROP CONSTRAINT IF EXISTS advertisements_click_behavior_check;

-- 3. Enforce that click_behavior can only be 'image' or 'link'
ALTER TABLE advertisements 
ADD CONSTRAINT advertisements_click_behavior_check 
CHECK (click_behavior IN ('image', 'link'));
