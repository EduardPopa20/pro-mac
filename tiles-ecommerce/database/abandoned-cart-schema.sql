-- Abandoned Cart Email System Database Schema
-- Pro-Mac Tiles E-commerce Platform
-- Version: 1.0
-- Date: December 30, 2024

-- =====================================================
-- 1. SERVER-SIDE CART STORAGE
-- =====================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS cart_recovery_tokens CASCADE;
DROP TABLE IF EXISTS abandoned_cart_emails CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;

-- Create carts table for server-side cart persistence
CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT, -- For anonymous users
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'recovered', 'completed')),
  abandoned_at TIMESTAMP WITH TIME ZONE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either user_id or session_id is present
  CONSTRAINT cart_identification CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Create cart items table
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate products in same cart
  UNIQUE(cart_id, product_id)
);

-- =====================================================
-- 2. EMAIL TRACKING
-- =====================================================

-- Track abandoned cart emails sent
CREATE TABLE abandoned_cart_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  email_number INTEGER NOT NULL CHECK (email_number BETWEEN 1 AND 3),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  resend_id TEXT, -- Resend API tracking ID
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'converted', 'bounced', 'failed')),
  
  -- Prevent sending same email number twice for same cart
  UNIQUE(cart_id, email_number)
);

-- =====================================================
-- 3. CART RECOVERY SYSTEM
-- =====================================================

-- Recovery tokens for email links
CREATE TABLE cart_recovery_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ANALYTICS & METRICS
-- =====================================================

-- Optional: Track cart events for analytics
CREATE TABLE cart_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'item_added', 'item_removed', 'item_updated', 
    'abandoned', 'recovered', 'email_sent', 'email_opened', 
    'email_clicked', 'completed', 'expired'
  )),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Cart indexes
CREATE INDEX idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session_id ON carts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_carts_abandoned_at ON carts(abandoned_at) WHERE abandoned_at IS NOT NULL;
CREATE INDEX idx_carts_created_at ON carts(created_at);
CREATE INDEX idx_carts_updated_at ON carts(updated_at);

-- Cart items indexes
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Email tracking indexes
CREATE INDEX idx_abandoned_cart_emails_cart_id ON abandoned_cart_emails(cart_id);
CREATE INDEX idx_abandoned_cart_emails_status ON abandoned_cart_emails(status);
CREATE INDEX idx_abandoned_cart_emails_sent_at ON abandoned_cart_emails(sent_at);

-- Recovery token indexes
CREATE INDEX idx_cart_recovery_tokens_token ON cart_recovery_tokens(token);
CREATE INDEX idx_cart_recovery_tokens_expires_at ON cart_recovery_tokens(expires_at);

-- Event tracking indexes
CREATE INDEX idx_cart_events_cart_id ON cart_events(cart_id);
CREATE INDEX idx_cart_events_event_type ON cart_events(event_type);
CREATE INDEX idx_cart_events_created_at ON cart_events(created_at);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_cart_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_recovery_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;

-- Carts policies
CREATE POLICY "Users can view own carts" ON carts
  FOR SELECT USING (
    auth.uid() = user_id OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can create own carts" ON carts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Users can update own carts" ON carts
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Service role can manage all carts" ON carts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id 
      AND (carts.user_id = auth.uid() OR 
           carts.session_id = current_setting('app.session_id', true))
    )
  );

CREATE POLICY "Users can manage own cart items" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = cart_items.cart_id 
      AND (carts.user_id = auth.uid() OR 
           carts.session_id = current_setting('app.session_id', true))
    )
  );

CREATE POLICY "Service role can manage all cart items" ON cart_items
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Email tracking policies (read-only for users)
CREATE POLICY "Users can view own email history" ON abandoned_cart_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM carts 
      WHERE carts.id = abandoned_cart_emails.cart_id 
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage emails" ON abandoned_cart_emails
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Recovery token policies
CREATE POLICY "Anyone can use valid recovery tokens" ON cart_recovery_tokens
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage tokens" ON cart_recovery_tokens
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Event tracking policies
CREATE POLICY "Service role can manage events" ON cart_events
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 7. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate and update cart total
CREATE OR REPLACE FUNCTION update_cart_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE carts
  SET total_amount = (
    SELECT COALESCE(SUM((price - discount_amount) * quantity), 0)
    FROM cart_items
    WHERE cart_id = COALESCE(NEW.cart_id, OLD.cart_id)
  )
  WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update cart total when items change
CREATE TRIGGER update_cart_total_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_cart_total();

-- Function to mark carts as abandoned (to be called by cron job)
CREATE OR REPLACE FUNCTION mark_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE carts
  SET 
    status = 'abandoned',
    abandoned_at = NOW()
  WHERE 
    status = 'active'
    AND updated_at < NOW() - INTERVAL '30 minutes'
    AND EXISTS (SELECT 1 FROM cart_items WHERE cart_id = carts.id);
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired carts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS INTEGER AS $$
DECLARE
  rows_deleted INTEGER;
BEGIN
  DELETE FROM carts
  WHERE 
    status IN ('abandoned', 'active')
    AND updated_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RETURN rows_deleted;
END;
$$ LANGUAGE plpgsql;

-- Function to log cart events
CREATE OR REPLACE FUNCTION log_cart_event(
  p_cart_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO cart_events (cart_id, event_type, event_data)
  VALUES (p_cart_id, p_event_type, p_event_data)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. SCHEDULED JOBS (Using pg_cron or Supabase Edge Functions)
-- =====================================================

-- Note: These need to be set up separately in Supabase Dashboard or via pg_cron extension

-- Example pg_cron jobs (run after enabling pg_cron extension):
-- SELECT cron.schedule('mark-abandoned-carts', '*/30 * * * *', 'SELECT mark_abandoned_carts();');
-- SELECT cron.schedule('cleanup-expired-carts', '0 2 * * *', 'SELECT cleanup_expired_carts();');

-- =====================================================
-- 9. SAMPLE DATA & TESTING
-- =====================================================

-- Optional: Insert test data for development
-- INSERT INTO carts (user_id, status) 
-- VALUES 
--   ((SELECT id FROM auth.users LIMIT 1), 'active');

-- =====================================================
-- 10. GRANTS FOR SUPABASE
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;
GRANT SELECT ON abandoned_cart_emails TO authenticated;
GRANT SELECT ON cart_recovery_tokens TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- To rollback this migration, run:
-- DROP TABLE IF EXISTS cart_events CASCADE;
-- DROP TABLE IF EXISTS cart_recovery_tokens CASCADE;
-- DROP TABLE IF EXISTS abandoned_cart_emails CASCADE;
-- DROP TABLE IF EXISTS cart_items CASCADE;
-- DROP TABLE IF EXISTS carts CASCADE;