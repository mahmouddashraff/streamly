-- 1. First, safely convert any existing 'header' ads to 'both' so they are not deleted
UPDATE advertisements
SET position = 'both'
WHERE position = 'header';

-- 2. Drop the existing check constraint on the position column
ALTER TABLE advertisements
DROP CONSTRAINT advertisements_position_check;

-- 3. Add the new constraint with 'left', 'right', 'both'
ALTER TABLE advertisements
ADD CONSTRAINT advertisements_position_check 
CHECK (position IN ('left', 'right', 'both'));
