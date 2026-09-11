-- 1. Update the position CHECK constraint to include the new combined positions
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_position_check;

ALTER TABLE advertisements ADD CONSTRAINT advertisements_position_check 
CHECK (position IN (
    'left', 
    'right', 
    'both', 
    'ads_page',
    'ads_page_left',
    'ads_page_right',
    'ads_page_both'
));
