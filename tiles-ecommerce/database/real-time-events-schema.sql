-- Create real_time_events table for SSE functionality
CREATE TABLE IF NOT EXISTS real_time_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL CHECK (entity IN ('showrooms', 'products', 'site_settings', 'categories')),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE real_time_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read events (needed for public site updates)
CREATE POLICY "Anyone can read real time events" ON real_time_events 
  FOR SELECT USING (true);

-- Policy: Only admins can insert events
CREATE POLICY "Only admins can create events" ON real_time_events 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX idx_real_time_events_entity_timestamp 
  ON real_time_events (entity, timestamp DESC);

CREATE INDEX idx_real_time_events_timestamp 
  ON real_time_events (timestamp DESC);

-- Enable real-time subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE real_time_events;

-- Auto-cleanup old events (keep only last 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
  DELETE FROM real_time_events 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run every hour (you can adjust this)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-events', '0 * * * *', 'SELECT cleanup_old_events();');