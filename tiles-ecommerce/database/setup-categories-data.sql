-- Setup Categories Data for Admin Testing
-- Execute this in Supabase SQL Editor to ensure categories exist

-- First ensure the categories table has data
INSERT INTO categories (name, is_active, sort_order) VALUES
('Faianță', true, 1),
('Gresie', true, 2),
('Mozaic', true, 3),
('Accesorii', true, 4)
ON CONFLICT (name) DO NOTHING;

-- Create or replace the view for categories with product count
CREATE OR REPLACE VIEW categories_with_product_count AS
SELECT 
  c.id,
  c.name,
  c.is_active,
  c.sort_order,
  c.created_at,
  c.updated_at,
  COUNT(p.id) as products_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.name, c.is_active, c.sort_order, c.created_at, c.updated_at
ORDER BY c.sort_order;

-- Grant permissions
GRANT SELECT ON categories_with_product_count TO authenticated;

-- Check if data exists
SELECT * FROM categories_with_product_count;