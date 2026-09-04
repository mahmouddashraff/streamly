-- Custom Forgot Password Schema

-- 1. Create table for storing OTPs
CREATE TABLE IF NOT EXISTS public.password_reset_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON public.password_reset_codes(email);

-- 2. Enable RLS and deny all client access (only service role backend should access this)
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Deny all access to password_reset_codes from client" ON public.password_reset_codes;
END $$;

CREATE POLICY "Deny all access to password_reset_codes from client"
ON public.password_reset_codes
FOR ALL
TO authenticated, anon
USING (false);

-- 3. Create a secure RPC to fetch user ID by email
-- We need this because auth.users is not directly queryable via PostgREST 
-- without exposing it, but the backend needs the UUID to update the password via Admin API.
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email_str text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- executes with privileges of the creator
AS $$
DECLARE
    found_id uuid;
BEGIN
    SELECT id INTO found_id FROM auth.users WHERE email = email_str;
    RETURN found_id;
END;
$$;
