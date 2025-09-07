-- Abandoned Cart Recovery System Schema
-- =====================================

-- 1. Abandoned carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User identification
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Cart data
  cart_items JSONB NOT NULL,
  cart_total DECIMAL(10,2) NOT NULL,
  items_count INT NOT NULL,
  
  -- Tracking
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Recovery
  recovery_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  recovery_sent_at TIMESTAMPTZ,
  recovery_sent_count INT DEFAULT 0,
  recovered_at TIMESTAMPTZ,
  recovery_discount_code TEXT,
  recovery_discount_amount DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'abandoned' CHECK (status IN ('abandoned', 'email_sent', 'recovered', 'expired', 'converted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  abandoned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Indexes
  INDEX idx_abandoned_email (email),
  INDEX idx_abandoned_status (status),
  INDEX idx_abandoned_token (recovery_token),
  INDEX idx_abandoned_created (created_at DESC)
);

-- 2. Recovery emails tracking
CREATE TABLE IF NOT EXISTS abandoned_cart_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abandoned_cart_id UUID REFERENCES abandoned_carts(id) ON DELETE CASCADE,
  
  -- Email details
  email_type TEXT NOT NULL CHECK (email_type IN ('first_reminder', 'second_reminder', 'final_offer')),
  subject TEXT NOT NULL,
  template_used TEXT NOT NULL,
  
  -- Discount offered
  discount_code TEXT,
  discount_percentage INT,
  discount_amount DECIMAL(10,2),
  
  -- Tracking
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'converted', 'bounced')),
  
  -- Metadata
  metadata JSONB,
  
  INDEX idx_email_cart (abandoned_cart_id),
  INDEX idx_email_sent (sent_at DESC)
);

-- 3. Recovery statistics
CREATE TABLE IF NOT EXISTS abandonment_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Period
  date DATE NOT NULL UNIQUE,
  
  -- Counts
  total_carts INT DEFAULT 0,
  abandoned_count INT DEFAULT 0,
  recovered_count INT DEFAULT 0,
  
  -- Values
  total_abandoned_value DECIMAL(12,2) DEFAULT 0,
  total_recovered_value DECIMAL(12,2) DEFAULT 0,
  
  -- Rates
  abandonment_rate DECIMAL(5,2), -- percentage
  recovery_rate DECIMAL(5,2), -- percentage
  
  -- Email performance
  emails_sent INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  emails_clicked INT DEFAULT 0,
  
  -- Average metrics
  avg_cart_value DECIMAL(10,2),
  avg_items_per_cart DECIMAL(5,2),
  avg_time_to_abandon INT, -- minutes
  avg_time_to_recover INT, -- hours
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Discount codes for recovery
CREATE TABLE IF NOT EXISTS recovery_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value DECIMAL(10,2) NOT NULL,
  
  -- Conditions
  min_cart_value DECIMAL(10,2),
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Assignment
  abandoned_cart_id UUID REFERENCES abandoned_carts(id),
  used_by_user_id UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_discount_code (code),
  INDEX idx_discount_cart (abandoned_cart_id)
);

-- 5. Functions and Triggers

-- Function to detect abandoned cart
CREATE OR REPLACE FUNCTION detect_abandoned_cart()
RETURNS void AS $$
DECLARE
  cart_record RECORD;
BEGIN
  -- Find carts that haven't been updated in 30 minutes
  FOR cart_record IN 
    SELECT DISTINCT ON (user_id, email) 
      user_id,
      email,
      cart_data,
      cart_total
    FROM cart_sessions
    WHERE 
      updated_at < NOW() - INTERVAL '30 minutes'
      AND cart_total > 0
      AND NOT EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.user_id = cart_sessions.user_id 
        AND orders.created_at > cart_sessions.updated_at
      )
      AND NOT EXISTS (
        SELECT 1 FROM abandoned_carts 
        WHERE abandoned_carts.email = cart_sessions.email
        AND abandoned_carts.created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    -- Insert into abandoned_carts
    INSERT INTO abandoned_carts (
      user_id,
      email,
      cart_items,
      cart_total,
      items_count,
      session_id
    ) VALUES (
      cart_record.user_id,
      cart_record.email,
      cart_record.cart_data,
      cart_record.cart_total,
      jsonb_array_length(cart_record.cart_data),
      cart_record.session_id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate recovery stats
CREATE OR REPLACE FUNCTION calculate_abandonment_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  stats RECORD;
BEGIN
  -- Calculate statistics for the given date
  WITH daily_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE DATE(created_at) = target_date) as total_abandoned,
      COUNT(*) FILTER (WHERE DATE(recovered_at) = target_date) as total_recovered,
      SUM(cart_total) FILTER (WHERE DATE(created_at) = target_date) as abandoned_value,
      SUM(cart_total) FILTER (WHERE DATE(recovered_at) = target_date) as recovered_value,
      AVG(cart_total) FILTER (WHERE DATE(created_at) = target_date) as avg_cart,
      AVG(items_count) FILTER (WHERE DATE(created_at) = target_date) as avg_items
    FROM abandoned_carts
  ),
  email_stats AS (
    SELECT
      COUNT(*) FILTER (WHERE DATE(sent_at) = target_date) as sent,
      COUNT(*) FILTER (WHERE DATE(opened_at) = target_date) as opened,
      COUNT(*) FILTER (WHERE DATE(clicked_at) = target_date) as clicked
    FROM abandoned_cart_emails
  )
  SELECT * INTO stats FROM daily_stats, email_stats;
  
  -- Insert or update stats
  INSERT INTO abandonment_stats (
    date,
    abandoned_count,
    recovered_count,
    total_abandoned_value,
    total_recovered_value,
    avg_cart_value,
    avg_items_per_cart,
    emails_sent,
    emails_opened,
    emails_clicked,
    abandonment_rate,
    recovery_rate
  ) VALUES (
    target_date,
    stats.total_abandoned,
    stats.total_recovered,
    stats.abandoned_value,
    stats.recovered_value,
    stats.avg_cart,
    stats.avg_items,
    stats.sent,
    stats.opened,
    stats.clicked,
    CASE 
      WHEN stats.total_abandoned > 0 
      THEN (stats.total_abandoned::DECIMAL / NULLIF(stats.total_abandoned + stats.total_recovered, 0)) * 100
      ELSE 0 
    END,
    CASE 
      WHEN stats.total_abandoned > 0 
      THEN (stats.total_recovered::DECIMAL / stats.total_abandoned) * 100
      ELSE 0 
    END
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    abandoned_count = EXCLUDED.abandoned_count,
    recovered_count = EXCLUDED.recovered_count,
    total_abandoned_value = EXCLUDED.total_abandoned_value,
    total_recovered_value = EXCLUDED.total_recovered_value,
    avg_cart_value = EXCLUDED.avg_cart_value,
    avg_items_per_cart = EXCLUDED.avg_items_per_cart,
    emails_sent = EXCLUDED.emails_sent,
    emails_opened = EXCLUDED.emails_opened,
    emails_clicked = EXCLUDED.emails_clicked,
    abandonment_rate = EXCLUDED.abandonment_rate,
    recovery_rate = EXCLUDED.recovery_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique discount code
CREATE OR REPLACE FUNCTION generate_discount_code(prefix TEXT DEFAULT 'SAVE')
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random code
    new_code := prefix || '-' || UPPER(substr(md5(random()::text), 1, 6));
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM recovery_discounts WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_cart_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_discounts ENABLE ROW LEVEL SECURITY;

-- Admin can see all
CREATE POLICY "Admin full access to abandoned carts" ON abandoned_carts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can see their own abandoned carts
CREATE POLICY "Users can view own abandoned carts" ON abandoned_carts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Public can recover cart with token
CREATE POLICY "Public can recover cart with token" ON abandoned_carts
  FOR SELECT USING (recovery_token IS NOT NULL);

-- Discount policies
CREATE POLICY "Public can view active discounts" ON recovery_discounts
  FOR SELECT USING (is_active = true AND valid_until > NOW());

CREATE POLICY "Users can use assigned discounts" ON recovery_discounts
  FOR UPDATE USING (
    abandoned_cart_id IN (
      SELECT id FROM abandoned_carts 
      WHERE user_id = auth.uid() OR email = (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

-- Indexes for performance
CREATE INDEX idx_abandoned_recent ON abandoned_carts(created_at DESC) 
  WHERE status = 'abandoned';
  
CREATE INDEX idx_abandoned_recoverable ON abandoned_carts(abandoned_at) 
  WHERE status = 'abandoned' AND recovery_sent_count < 3;

CREATE INDEX idx_discounts_active ON recovery_discounts(code) 
  WHERE is_active = true AND valid_until > NOW();

-- Scheduled job to detect abandoned carts (run every 30 minutes)
-- This would be set up as a cron job or Edge Function
COMMENT ON FUNCTION detect_abandoned_cart() IS 
  'Run every 30 minutes to detect and record abandoned carts';

COMMENT ON FUNCTION calculate_abandonment_stats(DATE) IS 
  'Run daily at midnight to calculate abandonment statistics';