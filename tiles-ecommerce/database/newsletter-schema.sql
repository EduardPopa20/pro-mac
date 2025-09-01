-- Newsletter Subscriptions Table
CREATE TABLE newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'modal' CHECK (source IN ('modal', 'footer', 'checkout', 'manual')),
  user_id UUID REFERENCES auth.users(id) NULL, -- Link to authenticated user if available
  ip_address INET,
  user_agent TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  last_email_sent_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter subscriptions
-- Allow anyone (anonymous or authenticated) to subscribe to newsletter
CREATE POLICY "Allow newsletter subscriptions" ON newsletter_subscriptions
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view their own subscription if authenticated
CREATE POLICY "Users can view own subscription" ON newsletter_subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous users to check by email in app logic
  );

-- Allow users to update their own subscription status (unsubscribe)
CREATE POLICY "Users can update own subscription" ON newsletter_subscriptions
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow anonymous unsubscribe via email link
  );

-- Only admins can view all newsletter subscriptions
CREATE POLICY "Admins can view all subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can update any subscription (for management purposes)
CREATE POLICY "Admins can update any subscription" ON newsletter_subscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only admins can delete subscriptions (GDPR compliance)
CREATE POLICY "Admins can delete subscriptions" ON newsletter_subscriptions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger (reuse existing function)
CREATE TRIGGER update_newsletter_subscriptions_updated_at 
  BEFORE UPDATE ON newsletter_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);
CREATE INDEX idx_newsletter_user_id ON newsletter_subscriptions(user_id) WHERE user_id IS NOT NULL;

-- Create function to check if email already exists (for app usage)
CREATE OR REPLACE FUNCTION is_email_subscribed(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM newsletter_subscriptions 
    WHERE LOWER(email) = LOWER(p_email) 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION is_email_subscribed(TEXT) TO authenticated, anon;