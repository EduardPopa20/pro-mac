-- Fix Categories Table and Populate Data
-- Execute this in Supabase SQL Editor

-- First, let's check the current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- If slug column doesn't exist, create it
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- If slug column exists but is nullable, make it not nullable after we populate it
-- We'll do this at the end

-- Clear existing data (optional - remove these lines if you want to keep existing data)
DELETE FROM products;
DELETE FROM categories;

-- Reset sequences to start from 1
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Insert categories one by one to debug any issues
INSERT INTO categories (name, slug, is_active, sort_order) VALUES ('Faianță', 'faianta', true, 1);
INSERT INTO categories (name, slug, is_active, sort_order) VALUES ('Gresie', 'gresie', true, 2);
INSERT INTO categories (name, slug, is_active, sort_order) VALUES ('Mozaic', 'mozaic', true, 3);
INSERT INTO categories (name, slug, is_active, sort_order) VALUES ('Accesorii', 'accesorii', true, 4);

-- Check if categories were inserted correctly
SELECT id, name, slug, is_active, sort_order FROM categories ORDER BY sort_order;

-- If slug is still null, let's update it manually
UPDATE categories SET slug = 'faianta' WHERE name = 'Faianță' AND slug IS NULL;
UPDATE categories SET slug = 'gresie' WHERE name = 'Gresie' AND slug IS NULL;
UPDATE categories SET slug = 'mozaic' WHERE name = 'Mozaic' AND slug IS NULL;
UPDATE categories SET slug = 'accesorii' WHERE name = 'Accesorii' AND slug IS NULL;

-- Verify categories again
SELECT id, name, slug, is_active, sort_order FROM categories ORDER BY sort_order;

-- Now insert products (only if categories were successful)
-- Faianță products
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Faianță Albă Clasică', 'faianta-alba-clasica', 'Faianță albă de înaltă calitate pentru baie, design clasic și elegant.', 45.50, 1, '25x40 cm', 'Ceramică', 'Lucios', 'Alb', 'Baie', true, true),
('Faianță Crem Elegantă', 'faianta-crem-eleganta', 'Faianță în nuanță crem caldă, ideală pentru băi cu accente naturale.', 42.80, 1, '25x40 cm', 'Ceramică', 'Mat', 'Crem', 'Baie', true, false),
('Faianță Gri Urban', 'faianta-gri-urban', 'Faianță modernă în tonuri de gri, perfectă pentru designul contemporan.', 48.90, 1, '30x60 cm', 'Ceramică', 'Satin', 'Gri', 'Baie', true, true),
('Faianță Beige Naturală', 'faianta-beige-naturala', 'Faianță în nuanțe naturale de beige, cu textură fin granulată.', 44.20, 1, '25x40 cm', 'Ceramică', 'Mat', 'Beige', 'Baie', true, false),
('Faianță Albastru Ocean', 'faianta-albastru-ocean', 'Faianță în nuanțe de albastru, perfectă pentru ambianțe relaxante.', 52.60, 1, '20x30 cm', 'Ceramică', 'Lucios', 'Albastru', 'Baie', true, false);

-- Gresie products
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Gresie Gri Modern', 'gresie-gri-modern', 'Gresie cu aspect modern pentru interior, rezistentă și elegantă.', 65.75, 2, '60x60 cm', 'Porțelan', 'Mat', 'Gri', 'Living', true, true),
('Gresie Bej Travertin', 'gresie-bej-travertin', 'Gresie cu aspect de piatră naturală travertin, perfectă pentru orice cameră.', 72.40, 2, '60x60 cm', 'Porțelan', 'Antiderapant', 'Bej', 'Living', true, false),
('Gresie Neagră Premium', 'gresie-neagra-premium', 'Gresie neagră de lux cu finisaj lucios, pentru designuri sofisticate.', 89.30, 2, '80x80 cm', 'Porțelan', 'Lucios', 'Negru', 'Living', true, true),
('Gresie Lemn Rustic', 'gresie-lemn-rustic', 'Gresie cu aspect de lemn pentru un look cald și natural.', 76.80, 2, '20x120 cm', 'Porțelan', 'Mat', 'Maro', 'Living', true, false),
('Gresie Exterior Antracit', 'gresie-exterior-antracit', 'Gresie rezistentă la îngheț pentru amenajări exterioare.', 68.90, 2, '60x60 cm', 'Porțelan', 'Antiderapant', 'Antracit', 'Exterior', true, false),
('Gresie Marmură Carrara', 'gresie-marmura-carrara', 'Gresie cu aspect de marmură Carrara, elegantă și sofisticată.', 95.60, 2, '60x120 cm', 'Porțelan', 'Lucios', 'Alb', 'Living', true, true);

-- Mozaic products
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Mozaic Sticlă Albastru', 'mozaic-sticla-albastru', 'Mozaic decorativ din sticlă în tonuri de albastru, perfect pentru accent walls.', 89.99, 3, '30x30 cm', 'Sticlă', 'Lucios', 'Albastru', 'Bucătărie', true, true),
('Mozaic Piatră Naturală', 'mozaic-piatra-naturala', 'Mozaic din piatră naturală cu texturi variate și culori calde.', 112.50, 3, '30x30 cm', 'Piatră Naturală', 'Natural', 'Mixt', 'Baie', true, false),
('Mozaic Metalic Gold', 'mozaic-metalic-gold', 'Mozaic cu accente metalice aurii, pentru designuri de lux.', 145.80, 3, '30x30 cm', 'Metal și Sticlă', 'Lucios', 'Auriu', 'Bucătărie', true, true),
('Mozaic Ceramic Traditional', 'mozaic-ceramic-traditional', 'Mozaic ceramic în stilul tradițional românesc, cu motive folclorice.', 78.40, 3, '20x20 cm', 'Ceramică', 'Mat', 'Multicolor', 'Baie', true, false);

-- Accesorii products
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Profil Finisare Aluminiu', 'profil-finisare-aluminiu', 'Profile de finisare din aluminiu pentru tranziții perfecte între suprafețe.', 25.60, 4, '2.5m lungime', 'Aluminiu', 'Anodizat', 'Argintiu', 'Universal', true, false),
('Adeziv Flexibil C2TE', 'adeziv-flexibil-c2te', 'Adeziv profesional pentru lipirea faiamței și gresei, rezistent la umiditate.', 35.40, 4, '25kg sac', 'Polimeric', 'Pudră', 'Gri', 'Universal', true, true),
('Chit de Rosturi Epoxidic', 'chit-rosturi-epoxidic', 'Chit de rosturi epoxidic, impermeabil și rezistent la pete.', 28.90, 4, '2kg cutie', 'Rășini Epoxidice', 'Pastă', 'Alb', 'Universal', true, false),
('Sistem Nivelare DLS', 'sistem-nivelare-dls', 'Sistem de nivelare pentru montajul perfect al plăcilor ceramice mari.', 45.20, 4, 'Set 100 bucăți', 'Plastic', 'Solid', 'Roșu', 'Universal', true, false),
('Spacere Cruciforme 3mm', 'spacere-cruciforme-3mm', 'Spacere din plastic pentru rosturi uniforme de 3mm.', 12.80, 4, 'Set 200 bucăți', 'Plastic', 'Solid', 'Alb', 'Universal', true, false);

-- Final verification
SELECT 
    c.name AS categorie,
    c.slug AS slug_categorie,
    COUNT(p.id) AS numar_produse,
    COUNT(CASE WHEN p.is_featured THEN 1 END) AS produse_evidenziate
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.name, c.slug
ORDER BY c.sort_order;