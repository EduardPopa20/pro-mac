-- Contact Rate Limiting System
-- Prevents spam and abuse of the contact form

-- 1. Create contact_attempts table
CREATE TABLE IF NOT EXISTS contact_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  form_type TEXT DEFAULT 'contact', -- contact, newsletter, etc.
  success BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}' -- For additional tracking data
);

-- Indexes for performance
CREATE INDEX idx_contact_attempts_email ON contact_attempts(email, attempt_time);
CREATE INDEX idx_contact_attempts_ip ON contact_attempts(ip_address, attempt_time);
CREATE INDEX idx_contact_attempts_time ON contact_attempts(attempt_time);

-- Enable RLS
ALTER TABLE contact_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role full access" ON contact_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- 2. Function to check rate limits
CREATE OR REPLACE FUNCTION check_contact_rate_limit(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_email_count INT;
  v_ip_count INT;
  v_last_attempt TIMESTAMP WITH TIME ZONE;
  v_minutes_since_last INT;
BEGIN
  -- Check email-based limits (3 per 24 hours)
  SELECT COUNT(*), MAX(attempt_time)
  INTO v_email_count, v_last_attempt
  FROM contact_attempts
  WHERE email = LOWER(TRIM(p_email))
    AND attempt_time > NOW() - INTERVAL '24 hours'
    AND success = TRUE;

  -- Check IP-based limits if IP provided (5 per 24 hours)
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_ip_count
    FROM contact_attempts
    WHERE ip_address = p_ip_address
      AND attempt_time > NOW() - INTERVAL '24 hours'
      AND success = TRUE;
  ELSE
    v_ip_count := 0;
  END IF;

  -- Calculate minutes since last attempt
  IF v_last_attempt IS NOT NULL THEN
    v_minutes_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_attempt)) / 60;
  ELSE
    v_minutes_since_last := 999;
  END IF;

  -- Return rate limit status
  RETURN jsonb_build_object(
    'allowed', v_email_count < 3 AND v_ip_count < 5,
    'email_count', v_email_count,
    'ip_count', v_ip_count,
    'minutes_since_last', v_minutes_since_last,
    'wait_seconds', CASE 
      WHEN v_email_count = 1 THEN 0
      WHEN v_email_count = 2 THEN 5
      ELSE 15
    END,
    'message', CASE
      WHEN v_email_count >= 3 THEN 'Ați atins limita de mesaje pentru această adresă de email. Vă rugăm să încercați din nou mâine.'
      WHEN v_ip_count >= 5 THEN 'Prea multe cereri de la această locație. Vă rugăm să încercați mai târziu.'
      WHEN v_minutes_since_last < 1 THEN 'Vă rugăm să așteptați un minut între mesaje.'
      ELSE 'OK'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to log contact attempt
CREATE OR REPLACE FUNCTION log_contact_attempt(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO contact_attempts (
    email, 
    ip_address, 
    user_agent, 
    success, 
    metadata
  )
  VALUES (
    LOWER(TRIM(p_email)),
    p_ip_address,
    p_user_agent,
    p_success,
    p_metadata
  )
  RETURNING id INTO v_attempt_id;
  
  RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Cleanup function for old attempts (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_old_contact_attempts()
RETURNS INT AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  DELETE FROM contact_attempts
  WHERE attempt_time < NOW() - INTERVAL '7 days'
  RETURNING * INTO v_deleted_count;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a view for analytics (optional)
CREATE OR REPLACE VIEW contact_attempts_summary AS
SELECT 
  DATE(attempt_time) as attempt_date,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_attempts,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as blocked_attempts
FROM contact_attempts
WHERE attempt_time > NOW() - INTERVAL '30 days'
GROUP BY DATE(attempt_time)
ORDER BY attempt_date DESC;

-- 6. Create suspicious activity detection
CREATE OR REPLACE FUNCTION detect_suspicious_activity(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_email_ips INT;
  v_ip_emails INT;
  v_rapid_attempts INT;
BEGIN
  -- Check if email is being used from multiple IPs
  SELECT COUNT(DISTINCT ip_address)
  INTO v_email_ips
  FROM contact_attempts
  WHERE email = LOWER(TRIM(p_email))
    AND attempt_time > NOW() - INTERVAL '1 hour';

  -- Check if IP is using multiple emails
  IF p_ip_address IS NOT NULL THEN
    SELECT COUNT(DISTINCT email)
    INTO v_ip_emails
    FROM contact_attempts
    WHERE ip_address = p_ip_address
      AND attempt_time > NOW() - INTERVAL '1 hour';
  ELSE
    v_ip_emails := 0;
  END IF;

  -- Check for rapid-fire attempts (more than 3 in 5 minutes)
  SELECT COUNT(*)
  INTO v_rapid_attempts
  FROM contact_attempts
  WHERE (email = LOWER(TRIM(p_email)) OR ip_address = p_ip_address)
    AND attempt_time > NOW() - INTERVAL '5 minutes';

  RETURN jsonb_build_object(
    'suspicious', v_email_ips > 3 OR v_ip_emails > 5 OR v_rapid_attempts > 3,
    'multiple_ips_per_email', v_email_ips,
    'multiple_emails_per_ip', v_ip_emails,
    'rapid_attempts', v_rapid_attempts,
    'requires_captcha', v_email_ips > 2 OR v_ip_emails > 3 OR v_rapid_attempts > 2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_contact_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_contact_attempt TO anon, authenticated;
GRANT EXECUTE ON FUNCTION detect_suspicious_activity TO anon, authenticated;