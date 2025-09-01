-- Populate Mock Data for Pro-Mac E-commerce
-- Execute this in Supabase SQL Editor

-- First, ensure categories exist (insert only if they don't exist)
INSERT INTO categories (name, is_active, sort_order, created_at, updated_at) 
SELECT 'Faianță', true, 1, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Faianță')
UNION ALL
SELECT 'Gresie', true, 2, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Gresie')
UNION ALL
SELECT 'Mozaic', true, 3, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Mozaic')
UNION ALL
SELECT 'Accesorii', true, 4, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Accesorii');

-- Get category IDs for reference
DO $$
DECLARE
    cat_faianta INTEGER;
    cat_gresie INTEGER;
    cat_mozaic INTEGER;
    cat_accesorii INTEGER;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_faianta FROM categories WHERE name = 'Faianță';
    SELECT id INTO cat_gresie FROM categories WHERE name = 'Gresie';
    SELECT id INTO cat_mozaic FROM categories WHERE name = 'Mozaic';
    SELECT id INTO cat_accesorii FROM categories WHERE name = 'Accesorii';
    
    -- Insert products for FAIANȚĂ category
    INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area, is_active, is_featured, created_at, updated_at) VALUES
    ('Faianță Albă Clasică', 'faianta-alba-clasica', 'Faianță albă de înaltă calitate pentru baie, design clasic și elegant. Perfectă pentru amenajări moderne și tradiționale.', 45.50, cat_faianta, '25x40 cm', 'Ceramică', 'Lucios', 'Alb', 'Baie', true, true, now(), now()),
    ('Faianță Crem Elegantă', 'faianta-crem-eleganta', 'Faianță în nuanță crem caldă, ideală pentru băi cu accente naturale.', 42.80, cat_faianta, '25x40 cm', 'Ceramică', 'Mat', 'Crem', 'Baie', true, false, now(), now()),
    ('Faianță Gri Urban', 'faianta-gri-urban', 'Faianță modernă în tonuri de gri, perfectă pentru designul contemporan.', 48.90, cat_faianta, '30x60 cm', 'Ceramică', 'Satin', 'Gri', 'Baie', true, true, now(), now()),
    ('Faianță Beige Naturală', 'faianta-beige-naturala', 'Faianță în nuanțe naturale de beige, cu textură fin granulată.', 44.20, cat_faianta, '25x40 cm', 'Ceramică', 'Mat', 'Beige', 'Baie', true, false, now(), now()),
    ('Faianță Albastru Ocean', 'faianta-albastru-ocean', 'Faianță în nuanțe de albastru, perfectă pentru ambianțe relaxante.', 52.60, cat_faianta, '20x30 cm', 'Ceramică', 'Lucios', 'Albastru', 'Baie', true, false, now(), now()),
    
    -- Insert products for GRESIE category
    ('Gresie Gri Modern', 'gresie-gri-modern', 'Gresie cu aspect modern pentru interior, rezistentă și elegantă. Ideală pentru living și dormitoare.', 65.75, cat_gresie, '60x60 cm', 'Porțelan', 'Mat', 'Gri', 'Living', true, true, now(), now()),
    ('Gresie Bej Travertin', 'gresie-bej-travertin', 'Gresie cu aspect de piatră naturală travertin, perfectă pentru orice cameră.', 72.40, cat_gresie, '60x60 cm', 'Porțelan', 'Antiderapant', 'Bej', 'Living', true, false, now(), now()),
    ('Gresie Neagră Premium', 'gresie-neagra-premium', 'Gresie neagră de lux cu finisaj lucios, pentru designuri sofisticate.', 89.30, cat_gresie, '80x80 cm', 'Porțelan', 'Lucios', 'Negru', 'Living', true, true, now(), now()),
    ('Gresie Lemn Rustic', 'gresie-lemn-rustic', 'Gresie cu aspect de lemn pentru un look cald și natural.', 76.80, cat_gresie, '20x120 cm', 'Porțelan', 'Mat', 'Maro', 'Living', true, false, now(), now()),
    ('Gresie Exterior Antracit', 'gresie-exterior-antracit', 'Gresie rezistentă la îngheț pentru amenajări exterioare.', 68.90, cat_gresie, '60x60 cm', 'Porțelan', 'Antiderapant', 'Antracit', 'Exterior', true, false, now(), now()),
    ('Gresie Marmură Carrara', 'gresie-marmura-carrara', 'Gresie cu aspect de marmură Carrara, elegantă și sofisticată.', 95.60, cat_gresie, '60x120 cm', 'Porțelan', 'Lucios', 'Alb', 'Living', true, true, now(), now()),
    
    -- Insert products for MOZAIC category
    ('Mozaic Sticlă Albastru', 'mozaic-sticla-albastru', 'Mozaic decorativ din sticlă în tonuri de albastru, perfect pentru accent walls în bucătărie sau baie.', 89.99, cat_mozaic, '30x30 cm', 'Sticlă', 'Lucios', 'Albastru', 'Bucătărie', true, true, now(), now()),
    ('Mozaic Piatră Naturală', 'mozaic-piatra-naturala', 'Mozaic din piatră naturală cu texturi variate și culori calde.', 112.50, cat_mozaic, '30x30 cm', 'Piatră Naturală', 'Natural', 'Mixt', 'Baie', true, false, now(), now()),
    ('Mozaic Metalic Gold', 'mozaic-metalic-gold', 'Mozaic cu accente metalice aurii, pentru designuri de lux.', 145.80, cat_mozaic, '30x30 cm', 'Metal și Sticlă', 'Lucios', 'Auriu', 'Bucătărie', true, true, now(), now()),
    ('Mozaic Ceramic Traditional', 'mozaic-ceramic-traditional', 'Mozaic ceramic în stilul tradițional românesc, cu motive folclorice.', 78.40, cat_mozaic, '20x20 cm', 'Ceramică', 'Mat', 'Multicolor', 'Baie', true, false, now(), now()),
    
    -- Insert products for ACCESORII category
    ('Profil Finisare Aluminiu', 'profil-finisare-aluminiu', 'Profile de finisare din aluminiu pentru tranziții perfecte între suprafețe.', 25.60, cat_accesorii, '2.5m lungime', 'Aluminiu', 'Anodizat', 'Argintiu', 'Universal', true, false, now(), now()),
    ('Adeziv Flexibil C2TE', 'adeziv-flexibil-c2te', 'Adeziv profesional pentru lipirea faiamței și gresei, rezistent la umiditate.', 35.40, cat_accesorii, '25kg sac', 'Polimeric', 'Pudră', 'Gri', 'Universal', true, true, now(), now()),
    ('Chit de Rosturi Epoxidic', 'chit-rosturi-epoxidic', 'Chit de rosturi epoxidic, impermeabil și rezistent la pete.', 28.90, cat_accesorii, '2kg cutie', 'Rășini Epoxidice', 'Pastă', 'Alb', 'Universal', true, false, now(), now()),
    ('Sistem Nivelare DLS', 'sistem-nivelare-dls', 'Sistem de nivelare pentru montajul perfect al plăcilor ceramice mari.', 45.20, cat_accesorii, 'Set 100 bucăți', 'Plastic', 'Solid', 'Roșu', 'Universal', true, false, now(), now()),
    ('Spacere Cruciforme 3mm', 'spacere-cruciforme-3mm', 'Spacere din plastic pentru rosturi uniforme de 3mm.', 12.80, cat_accesorii, 'Set 200 bucăți', 'Plastic', 'Solid', 'Alb', 'Universal', true, false, now(), now());
    
END $$;

-- Update some random products to be featured for variety
UPDATE products SET is_featured = true WHERE id IN (
    SELECT id FROM products WHERE is_featured = false ORDER BY RANDOM() LIMIT 3
);

-- Create slug generation function if it doesn't exist
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                translate(input_text, 'ăâîșțĂÂÎȘȚ', 'aaistaaiast'),
                                '[^a-zA-Z0-9\s]', '', 'g'
                            ),
                            '\s+', '-', 'g'
                        ),
                        '^-+', '', 'g'
                    ),
                    '-+$', '', 'g'
                ),
                '-{2,}', '-', 'g'
            ),
            '[^a-z0-9-]', '', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slugs for products that don't have them
UPDATE products SET slug = generate_slug(name) WHERE slug IS NULL OR slug = '' OR slug = generate_slug(name);

-- Ensure slugs are unique by appending numbers if needed
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN 
        SELECT id, slug 
        FROM products 
        WHERE slug IN (
            SELECT slug 
            FROM products 
            GROUP BY slug 
            HAVING COUNT(*) > 1
        )
        ORDER BY id
    LOOP
        UPDATE products 
        SET slug = product_record.slug || '-' || product_record.id::text 
        WHERE id = product_record.id;
    END LOOP;
END $$;

-- Show summary of inserted data
SELECT 
    c.name AS categorie,
    COUNT(p.id) AS numar_produse,
    COUNT(CASE WHEN p.is_featured THEN 1 END) AS produse_evidenziate
FROM categories c
LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
GROUP BY c.id, c.name
ORDER BY c.sort_order;