-- Fix Contact Messages for Anonymous Users
-- The current policy still doesn't work for anonymous users

-- Drop all existing policies first
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow anonymous contact form submissions" ON contact_messages;

-- Create a policy that explicitly allows anonymous users
CREATE POLICY "Enable insert for anonymous users" ON contact_messages
  FOR INSERT 
  WITH CHECK (true);

-- Alternative: If the above doesn't work, disable RLS temporarily for testing
-- ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later (run this after testing):
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Keep the admin policies
CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Test the policy with an anonymous insert
-- This should work now:
-- INSERT INTO contact_messages (name, email, message) 
-- VALUES ('Anonymous Test', 'test@example.com', 'This should work');