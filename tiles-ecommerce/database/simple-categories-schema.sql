-- ===================================
-- SCHEMA SIMPLĂ PENTRU CATEGORII ȘI PRODUSE
-- Restructurare Pro-Mac E-commerce
-- ===================================

-- Șterge coloanele complexe din categories (dacă există)
ALTER TABLE categories 
DROP COLUMN IF EXISTS parent_id,
DROP COLUMN IF EXISTS level,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS slug;

-- Păstrează doar coloanele esențiale
-- categories table structure:
-- id, name, is_active, sort_order, created_at, updated_at

-- Actualizează products table pentru Storage
ALTER TABLE products 
DROP COLUMN IF EXISTS image_url,
ADD COLUMN IF NOT EXISTS image_path TEXT; -- calea în Supabase Storage

-- Șterge coloanele opționale complexe din products dacă nu sunt necesare
-- Păstrăm doar esențialele pentru faianță și gresie

-- ===================================
-- RESETEAZĂ LA CATEGORII SIMPLE
-- ===================================

-- Șterge categoriile complexe existente
DELETE FROM categories;

-- Inserează categorii simple pentru faianță și gresie
INSERT INTO categories (name, is_active, sort_order) VALUES
('Faianță', true, 1),
('Gresie', true, 2),
('Mozaic', true, 3),
('Accesorii', true, 4)
ON CONFLICT DO NOTHING;

-- ===================================
-- ȘTERGE VIEW-URILE COMPLEXE
-- ===================================

DROP VIEW IF EXISTS main_categories_with_count;
DROP VIEW IF EXISTS subcategories_with_products;
DROP VIEW IF EXISTS category_hierarchy;
DROP FUNCTION IF EXISTS get_products_by_category_hierarchy(VARCHAR);

-- ===================================
-- VIEW SIMPLU PENTRU CATEGORII CU COUNT
-- ===================================

CREATE OR REPLACE VIEW categories_with_product_count AS
SELECT 
  c.*,
  COUNT(p.id) as products_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, c.is_active, c.sort_order, c.created_at, c.updated_at
ORDER BY c.sort_order;

-- ===================================
-- SUPABASE STORAGE SETUP
-- ===================================

-- Bucket pentru imagini produse (execută în Supabase Dashboard)
-- Storage -> New Bucket -> "product-images"
-- Settings: Public = true, File size limit = 10MB, Allowed types = image/*

-- Politici Storage (execută în SQL Editor)
-- Permite upload pentru admini
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
  'product-images',
  'Admin can upload product images',
  'auth.uid() IN (SELECT id FROM profiles WHERE role = ''admin'')'::text
);

-- Permite citire publică
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
  'product-images',
  'Public can view product images',
  'true'::text
);

-- ===================================
-- SAMPLE DATA PENTRU TESTARE
-- ===================================

-- Sample products cu image_path
/*
INSERT INTO products (name, description, price, category_id, image_path, dimensions, material, finish, color, usage_area) VALUES
('Faianță Albă Clasică', 'Faianță albă pentru baie, design clasic și elegant', 45.50, 1, 'faianta-alba-clasica.jpg', '25x40 cm', 'Ceramică', 'Lucios', 'Alb', 'Baie'),
('Gresie Gri Modern', 'Gresie cu aspect modern pentru living', 65.75, 2, 'gresie-gri-modern.jpg', '60x60 cm', 'Porțelan', 'Mat', 'Gri', 'Living'),
('Mozaic Decorativ', 'Mozaic colorat pentru accent walls', 89.99, 3, 'mozaic-decorativ.jpg', '30x30 cm', 'Sticlă', 'Lucios', 'Multicolor', 'Bucătărie');
*/

-- Grant permissions
GRANT SELECT ON categories_with_product_count TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON products TO authenticated;