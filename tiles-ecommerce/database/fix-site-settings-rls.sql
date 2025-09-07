-- Fix Site Settings RLS Policy for INSERT operations
-- This adds the missing INSERT policy that is needed when using upsert operations

-- Add INSERT policy for site_settings table
CREATE POLICY "Admins can insert site_settings" ON site_settings
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Also add DELETE policy in case it's needed for admin operations
CREATE POLICY "Admins can delete site_settings" ON site_settings
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));