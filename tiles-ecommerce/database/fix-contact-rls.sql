-- Fix Contact Messages RLS Policies
-- The original policy was too restrictive for anonymous users

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;

-- Create a new policy that allows anonymous users to insert
CREATE POLICY "Allow anonymous contact form submissions" ON contact_messages
  FOR INSERT 
  WITH CHECK (true);

-- Verify the policy works by testing
-- (You can run this to test the policy)
-- INSERT INTO contact_messages (name, email, message) VALUES ('Test User', 'test@example.com', 'Test message');

-- The existing SELECT and UPDATE policies for admins are fine:
-- "Admins can view all contact messages" 
-- "Admins can update contact messages"