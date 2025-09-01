-- Simplest approach: Temporarily disable RLS for contact_messages
-- This allows anonymous users to insert contact messages

-- TEMPORARY: Disable RLS for testing
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Test this first, then we can re-enable with proper policies later
-- After confirming it works, run this to re-enable RLS:

/*
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Then create these policies:
CREATE POLICY "Public can insert contact messages" ON contact_messages
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert contact messages" ON contact_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
*/