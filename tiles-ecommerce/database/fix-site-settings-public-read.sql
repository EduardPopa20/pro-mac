-- Fix Site Settings RLS to allow public read access
-- This allows public users to read site settings (needed for WhatsApp button, etc.)
-- but still restricts INSERT/UPDATE/DELETE to admins only

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Admins can view site_settings" ON site_settings;

-- Create a new policy that allows everyone to read site settings
CREATE POLICY "Everyone can view site_settings" ON site_settings
  FOR SELECT USING (true);

-- Keep the admin-only policies for modifications
-- (INSERT and DELETE policies should already exist from previous fix)