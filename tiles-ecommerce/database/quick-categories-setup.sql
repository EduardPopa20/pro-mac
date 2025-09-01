-- Quick Categories Setup - Run this in Supabase SQL Editor
-- This will create the necessary categories for testing

-- Insert basic categories
INSERT INTO categories (name, is_active, sort_order, created_at, updated_at) VALUES
('Faianță', true, 1, now(), now()),
('Gresie', true, 2, now(), now()),
('Mozaic', true, 3, now(), now()),
('Accesorii', true, 4, now(), now())
ON CONFLICT (name) DO UPDATE SET 
  updated_at = now();

-- Check if categories were created
SELECT id, name, is_active, sort_order FROM categories ORDER BY sort_order;