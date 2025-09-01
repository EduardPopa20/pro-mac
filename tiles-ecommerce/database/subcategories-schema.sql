-- ===================================
-- SUBCATEGORII/MODELE PENTRU PRODUSE
-- Schema Extension pentru Pro-Mac E-commerce
-- ===================================

-- Adaugă coloane pentru structura ierarhică în tabelul categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0 CHECK (level BETWEEN 0 AND 2);

-- Actualizează categoriile existente pentru a fi categorii principale (level 0)
UPDATE categories SET level = 0 WHERE level IS NULL;

-- Adaugă indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- ===================================
-- SUBCATEGORII PENTRU FAIANȚĂ BAIE
-- ===================================
INSERT INTO categories (name, description, slug, parent_id, level, sort_order) VALUES
-- Subcategorii pentru Faianță Baie (ID = 1)
('Modern', 'Design modern și contemporan', 'faianta-baie-modern', 1, 1, 1),
('Classic', 'Design clasic și timeless', 'faianta-baie-classic', 1, 1, 2),
('Rustic', 'Design rustic și natural', 'faianta-baie-rustic', 1, 1, 3),
('Art Deco', 'Design Art Deco elegant', 'faianta-baie-art-deco', 1, 1, 4)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- SUBCATEGORII PENTRU GRESIE INTERIOR
-- ===================================
INSERT INTO categories (name, description, slug, parent_id, level, sort_order) VALUES
-- Subcategorii pentru Gresie Interior (ID = 2)
('Contemporary', 'Gresie cu design contemporary', 'gresie-interior-contemporary', 2, 1, 1),
('Traditional', 'Gresie cu design tradițional', 'gresie-interior-traditional', 2, 1, 2),
('Minimalist', 'Gresie cu design minimalist', 'gresie-interior-minimalist', 2, 1, 3),
('Industrial', 'Gresie cu aspect industrial', 'gresie-interior-industrial', 2, 1, 4)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- SUBCATEGORII PENTRU GRESIE EXTERIOR
-- ===================================
INSERT INTO categories (name, description, slug, parent_id, level, sort_order) VALUES
-- Subcategorii pentru Gresie Exterior (ID = 3)
('Stone Effect', 'Efect de piatră naturală', 'gresie-exterior-stone', 3, 1, 1),
('Wood Effect', 'Efect de lemn rezistent', 'gresie-exterior-wood', 3, 1, 2),
('Anti-Slip', 'Suprafață antiderapantă', 'gresie-exterior-antislip', 3, 1, 3),
('Pool Area', 'Special pentru piscine', 'gresie-exterior-pool', 3, 1, 4)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- SUBCATEGORII PENTRU MOZAIC
-- ===================================
INSERT INTO categories (name, description, slug, parent_id, level, sort_order) VALUES
-- Subcategorii pentru Mozaic (ID = 4)
('Glass Mosaic', 'Mozaic din sticlă', 'mozaic-glass', 4, 1, 1),
('Stone Mosaic', 'Mozaic din piatră', 'mozaic-stone', 4, 1, 2),
('Metal Mosaic', 'Mozaic cu elemente metalice', 'mozaic-metal', 4, 1, 3),
('Mixed Materials', 'Mozaic din materiale mixte', 'mozaic-mixed', 4, 1, 4)
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- VIEWS PENTRU QUERIES OPTIMIZATE
-- ===================================

-- View pentru categorii principale cu numărul de subcategorii
CREATE OR REPLACE VIEW main_categories_with_count AS
SELECT 
  c.*,
  COUNT(sub.id) as subcategories_count,
  COUNT(p.id) as total_products_count
FROM categories c
LEFT JOIN categories sub ON c.id = sub.parent_id
LEFT JOIN products p ON (p.category_id = c.id OR p.category_id = sub.id)
WHERE c.level = 0 AND c.is_active = true
GROUP BY c.id, c.name, c.description, c.slug, c.is_active, c.sort_order, c.created_at, c.updated_at, c.parent_id, c.level
ORDER BY c.sort_order;

-- View pentru subcategorii cu numărul de produse
CREATE OR REPLACE VIEW subcategories_with_products AS
SELECT 
  sub.*,
  main.name as parent_name,
  main.slug as parent_slug,
  COUNT(p.id) as products_count
FROM categories sub
JOIN categories main ON sub.parent_id = main.id
LEFT JOIN products p ON p.category_id = sub.id
WHERE sub.level = 1 AND sub.is_active = true
GROUP BY sub.id, sub.name, sub.description, sub.slug, sub.is_active, sub.sort_order, 
         sub.created_at, sub.updated_at, sub.parent_id, sub.level,
         main.name, main.slug
ORDER BY main.sort_order, sub.sort_order;

-- View pentru structura completă a categoriilor (pentru sidebar)
CREATE OR REPLACE VIEW category_hierarchy AS
WITH RECURSIVE category_tree AS (
  -- Categorii principale
  SELECT 
    id, name, slug, description, parent_id, level, sort_order,
    name as full_path,
    slug as full_slug,
    0 as depth
  FROM categories 
  WHERE level = 0 AND is_active = true
  
  UNION ALL
  
  -- Subcategorii
  SELECT 
    c.id, c.name, c.slug, c.description, c.parent_id, c.level, c.sort_order,
    ct.full_path || ' > ' || c.name as full_path,
    ct.full_slug || '/' || c.slug as full_slug,
    ct.depth + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
  WHERE c.is_active = true
)
SELECT 
  ct.*,
  COUNT(p.id) as products_count
FROM category_tree ct
LEFT JOIN products p ON p.category_id = ct.id AND p.is_active = true
GROUP BY ct.id, ct.name, ct.slug, ct.description, ct.parent_id, ct.level, 
         ct.sort_order, ct.full_path, ct.full_slug, ct.depth
ORDER BY ct.level, ct.sort_order;

-- ===================================
-- FUNCȚII HELPER PENTRU GESTIONARE
-- ===================================

-- Funcție pentru a obține toate produsele dintr-o categorie (inclusiv subcategorii)
CREATE OR REPLACE FUNCTION get_products_by_category_hierarchy(category_slug VARCHAR)
RETURNS TABLE(
  product_id INTEGER,
  product_name VARCHAR,
  product_slug VARCHAR,
  price DECIMAL,
  category_name VARCHAR,
  subcategory_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  WITH category_ids AS (
    SELECT c.id 
    FROM categories c 
    WHERE c.slug = category_slug 
       OR c.parent_id IN (SELECT id FROM categories WHERE slug = category_slug)
  )
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.price,
    main.name as category_name,
    sub.name as subcategory_name
  FROM products p
  JOIN category_ids ci ON p.category_id = ci.id
  JOIN categories c ON p.category_id = c.id
  LEFT JOIN categories main ON (CASE WHEN c.level = 0 THEN c.id ELSE c.parent_id END) = main.id
  LEFT JOIN categories sub ON (CASE WHEN c.level = 1 THEN c.id ELSE NULL END) = sub.id
  WHERE p.is_active = true
  ORDER BY main.sort_order, sub.sort_order, p.name;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- ACTUALIZARE POLITICI RLS
-- ===================================

-- Politicile RLS rămân aceleași deoarece folosim aceeași tabelă categories
-- Doar adăugăm acces pentru view-uri

-- Grant permissions pe view-uri pentru utilizatori autentificați
GRANT SELECT ON main_categories_with_count TO authenticated;
GRANT SELECT ON subcategories_with_products TO authenticated;
GRANT SELECT ON category_hierarchy TO authenticated;

-- ===================================
-- SAMPLE DATA PENTRU TESTARE
-- ===================================

-- Produse sample pentru subcategorii (uncomment pentru testare)
/*
-- Pentru Faianță Baie > Modern
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_featured) 
SELECT 
  'Faianță Albă Ultra Modern', 
  'faianta-alba-ultra-modern', 
  'Faianță cu design ultra modern, perfect pentru băi contemporane', 
  52.90, 
  id, 
  '30x60 cm', 
  'Ceramică Premium', 
  'Lucios', 
  'Alb Pur', 
  'Baie', 
  true
FROM categories WHERE slug = 'faianta-baie-modern';

-- Pentru Gresie Interior > Contemporary  
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_featured)
SELECT
  'Gresie Contemporary Grey',
  'gresie-contemporary-grey',
  'Gresie cu design contemporary perfect pentru living-uri moderne',
  89.50,
  id,
  '80x80 cm',
  'Porțelan Rectificat',
  'Mat',
  'Gri Antracit',
  'Living',
  true
FROM categories WHERE slug = 'gresie-interior-contemporary';
*/