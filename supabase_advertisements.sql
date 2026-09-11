-- 10. Advertisements System
CREATE TABLE IF NOT EXISTS advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('header', 'left', 'right')),
    active BOOLEAN DEFAULT true NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to update updated_at timestamp on advertisements
CREATE OR REPLACE FUNCTION update_advertisements_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_advertisements_updated_at ON advertisements;
CREATE TRIGGER update_advertisements_updated_at
    BEFORE UPDATE ON advertisements
    FOR EACH ROW
    EXECUTE FUNCTION update_advertisements_updated_at_column();

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Public can view active advertisements
DROP POLICY IF EXISTS "Public can view active advertisements" ON advertisements;
CREATE POLICY "Public can view active advertisements"
ON advertisements FOR SELECT
USING (active = true);

-- Admins have full access to advertisements
DROP POLICY IF EXISTS "Admins have full access to advertisements" ON advertisements;
CREATE POLICY "Admins have full access to advertisements"
ON advertisements FOR ALL
USING (public.is_admin());
