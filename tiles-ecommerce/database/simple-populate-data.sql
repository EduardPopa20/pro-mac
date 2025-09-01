-- Simple Mock Data Population for Pro-Mac E-commerce
-- Execute this in Supabase SQL Editor

-- Clear existing data (optional - remove these lines if you want to keep existing data)
DELETE FROM products;
DELETE FROM categories;

-- Insert categories with slugs
INSERT INTO categories (name, slug, is_active, sort_order) VALUES
('Faianță', 'faianta', true, 1),
('Gresie', 'gresie', true, 2),
('Mozaic', 'mozaic', true, 3),
('Accesorii', 'accesorii', true, 4);

-- Insert products for Faianță
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Faianță Albă Clasică', 'faianta-alba-clasica', 'Faianță albă de înaltă calitate pentru baie, design clasic și elegant.', 45.50, (SELECT id FROM categories WHERE name = 'Faianță'), '25x40 cm', 'Ceramică', 'Lucios', 'Alb', 'Baie', true, true),
('Faianță Crem Elegantă', 'faianta-crem-eleganta', 'Faianță în nuanță crem caldă, ideală pentru băi cu accente naturale.', 42.80, (SELECT id FROM categories WHERE name = 'Faianță'), '25x40 cm', 'Ceramică', 'Mat', 'Crem', 'Baie', true, false),
('Faianță Gri Urban', 'faianta-gri-urban', 'Faianță modernă în tonuri de gri, perfectă pentru designul contemporan.', 48.90, (SELECT id FROM categories WHERE name = 'Faianță'), '30x60 cm', 'Ceramică', 'Satin', 'Gri', 'Baie', true, true),
('Faianță Beige Naturală', 'faianta-beige-naturala', 'Faianță în nuanțe naturale de beige, cu textură fin granulată.', 44.20, (SELECT id FROM categories WHERE name = 'Faianță'), '25x40 cm', 'Ceramică', 'Mat', 'Beige', 'Baie', true, false),
('Faianță Albastru Ocean', 'faianta-albastru-ocean', 'Faianță în nuanțe de albastru, perfectă pentru ambianțe relaxante.', 52.60, (SELECT id FROM categories WHERE name = 'Faianță'), '20x30 cm', 'Ceramică', 'Lucios', 'Albastru', 'Baie', true, false);

-- Insert products for Gresie
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Gresie Gri Modern', 'gresie-gri-modern', 'Gresie cu aspect modern pentru interior, rezistentă și elegantă.', 65.75, (SELECT id FROM categories WHERE name = 'Gresie'), '60x60 cm', 'Porțelan', 'Mat', 'Gri', 'Living', true, true),
('Gresie Bej Travertin', 'gresie-bej-travertin', 'Gresie cu aspect de piatră naturală travertin, perfectă pentru orice cameră.', 72.40, (SELECT id FROM categories WHERE name = 'Gresie'), '60x60 cm', 'Porțelan', 'Antiderapant', 'Bej', 'Living', true, false),
('Gresie Neagră Premium', 'gresie-neagra-premium', 'Gresie neagră de lux cu finisaj lucios, pentru designuri sofisticate.', 89.30, (SELECT id FROM categories WHERE name = 'Gresie'), '80x80 cm', 'Porțelan', 'Lucios', 'Negru', 'Living', true, true),
('Gresie Lemn Rustic', 'gresie-lemn-rustic', 'Gresie cu aspect de lemn pentru un look cald și natural.', 76.80, (SELECT id FROM categories WHERE name = 'Gresie'), '20x120 cm', 'Porțelan', 'Mat', 'Maro', 'Living', true, false),
('Gresie Exterior Antracit', 'gresie-exterior-antracit', 'Gresie rezistentă la îngheț pentru amenajări exterioare.', 68.90, (SELECT id FROM categories WHERE name = 'Gresie'), '60x60 cm', 'Porțelan', 'Antiderapant', 'Antracit', 'Exterior', true, false),
('Gresie Marmură Carrara', 'gresie-marmura-carrara', 'Gresie cu aspect de marmură Carrara, elegantă și sofisticată.', 95.60, (SELECT id FROM categories WHERE name = 'Gresie'), '60x120 cm', 'Porțelan', 'Lucios', 'Alb', 'Living', true, true);

-- Insert products for Mozaic
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Mozaic Sticlă Albastru', 'mozaic-sticla-albastru', 'Mozaic decorativ din sticlă în tonuri de albastru, perfect pentru accent walls.', 89.99, (SELECT id FROM categories WHERE name = 'Mozaic'), '30x30 cm', 'Sticlă', 'Lucios', 'Albastru', 'Bucătărie', true, true),
('Mozaic Piatră Naturală', 'mozaic-piatra-naturala', 'Mozaic din piatră naturală cu texturi variate și culori calde.', 112.50, (SELECT id FROM categories WHERE name = 'Mozaic'), '30x30 cm', 'Piatră Naturală', 'Natural', 'Mixt', 'Baie', true, false),
('Mozaic Metalic Gold', 'mozaic-metalic-gold', 'Mozaic cu accente metalice aurii, pentru designuri de lux.', 145.80, (SELECT id FROM categories WHERE name = 'Mozaic'), '30x30 cm', 'Metal și Sticlă', 'Lucios', 'Auriu', 'Bucătărie', true, true),
('Mozaic Ceramic Traditional', 'mozaic-ceramic-traditional', 'Mozaic ceramic în stilul tradițional românesc, cu motive folclorice.', 78.40, (SELECT id FROM categories WHERE name = 'Mozaic'), '20x20 cm', 'Ceramică', 'Mat', 'Multicolor', 'Baie', true, false);

-- Insert products for Accesorii
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured) VALUES
('Profil Finisare Aluminiu', 'profil-finisare-aluminiu', 'Profile de finisare din aluminiu pentru tranziții perfecte între suprafețe.', 25.60, (SELECT id FROM categories WHERE name = 'Accesorii'), '2.5m lungime', 'Aluminiu', 'Anodizat', 'Argintiu', 'Universal', true, false),
('Adeziv Flexibil C2TE', 'adeziv-flexibil-c2te', 'Adeziv profesional pentru lipirea faiamței și gresei, rezistent la umiditate.', 35.40, (SELECT id FROM categories WHERE name = 'Accesorii'), '25kg sac', 'Polimeric', 'Pudră', 'Gri', 'Universal', true, true),
('Chit de Rosturi Epoxidic', 'chit-rosturi-epoxidic', 'Chit de rosturi epoxidic, impermeabil și rezistent la pete.', 28.90, (SELECT id FROM categories WHERE name = 'Accesorii'), '2kg cutie', 'Rășini Epoxidice', 'Pastă', 'Alb', 'Universal', true, false),
('Sistem Nivelare DLS', 'sistem-nivelare-dls', 'Sistem de nivelare pentru montajul perfect al plăcilor ceramice mari.', 45.20, (SELECT id FROM categories WHERE name = 'Accesorii'), 'Set 100 bucăți', 'Plastic', 'Solid', 'Roșu', 'Universal', true, false),
('Spacere Cruciforme 3mm', 'spacere-cruciforme-3mm', 'Spacere din plastic pentru rosturi uniforme de 3mm.', 12.80, (SELECT id FROM categories WHERE name = 'Accesorii'), 'Set 200 bucăți', 'Plastic', 'Solid', 'Alb', 'Universal', true, false);

-- Show summary
SELECT 
    c.name AS categorie,
    COUNT(p.id) AS numar_produse,
    COUNT(CASE WHEN p.is_featured THEN 1 END) AS produse_evidenziate
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.name
ORDER BY c.sort_order;