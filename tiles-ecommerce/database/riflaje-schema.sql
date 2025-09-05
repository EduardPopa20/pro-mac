-- Riflaje Database Schema for Pro-Mac E-commerce
-- Based on Romanian market research (Dedeman, Leroy Merlin, FrontMDF)
-- Execute in Supabase SQL Editor

-- ===================================
-- 1. ADD RIFLAJE CATEGORY
-- ===================================
INSERT INTO categories (name, description, slug, is_active, sort_order) VALUES
('Riflaje', 'Panouri decorative și acustice - MDF, lemn solid și polistiren pentru amenajări moderne', 'riflaje', true, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true,
  sort_order = 4;

-- ===================================
-- 2. ENHANCED PRODUCTS TABLE FOR RIFLAJE
-- ===================================
DO $$ 
BEGIN 
    -- Panel Type (MDF, Lemn Solid, Polistiren, Acustic)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_type') THEN
        ALTER TABLE products ADD COLUMN panel_type VARCHAR(100);
    END IF;
    
    -- Thickness in mm (8-22mm common range)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_thickness_mm') THEN
        ALTER TABLE products ADD COLUMN panel_thickness_mm DECIMAL(4,1);
    END IF;
    
    -- Width in mm (30-245mm standard)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_width_mm') THEN
        ALTER TABLE products ADD COLUMN panel_width_mm DECIMAL(8,2);
    END IF;
    
    -- Length in mm (2400-2900mm typical)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_length_mm') THEN
        ALTER TABLE products ADD COLUMN panel_length_mm DECIMAL(8,2);
    END IF;
    
    -- Acoustic Properties (fonoabsorbant, decorativ, mixt)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'acoustic_properties') THEN
        ALTER TABLE products ADD COLUMN acoustic_properties VARCHAR(100);
    END IF;
    
    -- Surface Finish (Mat, Ultramat, Synchro, Forest, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'surface_finish_type') THEN
        ALTER TABLE products ADD COLUMN surface_finish_type VARCHAR(100);
    END IF;
    
    -- Mounting System (lipire, înșurubare, profile montaj)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'mounting_system') THEN
        ALTER TABLE products ADD COLUMN mounting_system VARCHAR(100);
    END IF;
    
    -- Panel Orientation (vertical, orizontal, ambele)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_orientation') THEN
        ALTER TABLE products ADD COLUMN panel_orientation VARCHAR(50);
    END IF;
    
    -- Wood Species (for solid wood panels: stejar, nuc, pin, fag)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'wood_species') THEN
        ALTER TABLE products ADD COLUMN wood_species VARCHAR(100);
    END IF;
    
    -- Base Material (MDF 18mm, lemn masiv, polistiren extrudat)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'base_material') THEN
        ALTER TABLE products ADD COLUMN base_material VARCHAR(100);
    END IF;
    
    -- Acoustic Rating (coeficient absorbtie zgomot)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'acoustic_rating') THEN
        ALTER TABLE products ADD COLUMN acoustic_rating VARCHAR(50);
    END IF;
    
    -- Installation Area (interior, exterior, ambele)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'installation_area') THEN
        ALTER TABLE products ADD COLUMN installation_area VARCHAR(100);
    END IF;
    
    -- Panel Profile/Model (DIMENSION, SPACE, NOVA, EXPRESS, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_profile') THEN
        ALTER TABLE products ADD COLUMN panel_profile VARCHAR(100);
    END IF;
    
    -- Surface Coverage per unit (m² per panel)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'coverage_per_panel') THEN
        ALTER TABLE products ADD COLUMN coverage_per_panel DECIMAL(8,4);
    END IF;
    
    -- Panel Weight (kg per unit)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'panel_weight_kg') THEN
        ALTER TABLE products ADD COLUMN panel_weight_kg DECIMAL(6,2);
    END IF;
    
    -- Groove Width/Spacing (for riflaj pattern)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'groove_spacing_mm') THEN
        ALTER TABLE products ADD COLUMN groove_spacing_mm DECIMAL(4,1);
    END IF;
    
    -- Groove Depth (adâncime caneluri)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'groove_depth_mm') THEN
        ALTER TABLE products ADD COLUMN groove_depth_mm DECIMAL(4,1);
    END IF;
    
    -- Fire Resistance (clasa rezistenta foc)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fire_resistance_class') THEN
        ALTER TABLE products ADD COLUMN fire_resistance_class VARCHAR(50);
    END IF;
    
    -- Environmental Rating (certificari ecologice)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'environmental_rating') THEN
        ALTER TABLE products ADD COLUMN environmental_rating VARCHAR(100);
    END IF;
    
    -- Maintenance Type (întreținere: ușoară, medie, intensivă)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'maintenance_type') THEN
        ALTER TABLE products ADD COLUMN maintenance_type VARCHAR(100);
    END IF;
    
    -- Color Variants (variante culoare disponibile)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'color_variants') THEN
        ALTER TABLE products ADD COLUMN color_variants TEXT;
    END IF;
    
    -- Acoustic Backing (pentru panouri acustice: fetru, spuma, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'acoustic_backing') THEN
        ALTER TABLE products ADD COLUMN acoustic_backing VARCHAR(100);
    END IF;
    
    -- UV Resistance (rezistenta UV pentru exterior)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'uv_resistance') THEN
        ALTER TABLE products ADD COLUMN uv_resistance BOOLEAN DEFAULT false;
    END IF;
    
    -- Moisture Resistance (rezistenta umiditate)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'moisture_resistance') THEN
        ALTER TABLE products ADD COLUMN moisture_resistance VARCHAR(50);
    END IF;
    
    -- Installation Difficulty (dificultate instalare: ușoară, medie, avansată)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'installation_difficulty') THEN
        ALTER TABLE products ADD COLUMN installation_difficulty VARCHAR(50);
    END IF;
    
END $$;

-- ===================================
-- 3. INSERT 25+ DIVERSE RIFLAJE PRODUCTS
-- ===================================
INSERT INTO products (
    name, slug, description, price, category_id,
    brand, product_code, panel_type, panel_thickness_mm, 
    panel_width_mm, panel_length_mm, acoustic_properties,
    surface_finish_type, mounting_system, panel_orientation,
    wood_species, base_material, acoustic_rating,
    installation_area, panel_profile, coverage_per_panel,
    panel_weight_kg, groove_spacing_mm, groove_depth_mm,
    fire_resistance_class, environmental_rating, maintenance_type,
    color_variants, acoustic_backing, uv_resistance, moisture_resistance,
    installation_difficulty, dimensions, material, finish, 
    color, usage_area, is_active, image_url
)
SELECT 
    products_data.name,
    products_data.slug,
    products_data.description,
    products_data.price,
    c.id as category_id,
    products_data.brand,
    products_data.product_code,
    products_data.panel_type,
    products_data.panel_thickness_mm,
    products_data.panel_width_mm,
    products_data.panel_length_mm,
    products_data.acoustic_properties,
    products_data.surface_finish_type,
    products_data.mounting_system,
    products_data.panel_orientation,
    products_data.wood_species,
    products_data.base_material,
    products_data.acoustic_rating,
    products_data.installation_area,
    products_data.panel_profile,
    products_data.coverage_per_panel,
    products_data.panel_weight_kg,
    products_data.groove_spacing_mm,
    products_data.groove_depth_mm,
    products_data.fire_resistance_class,
    products_data.environmental_rating,
    products_data.maintenance_type,
    products_data.color_variants,
    products_data.acoustic_backing,
    products_data.uv_resistance,
    products_data.moisture_resistance,
    products_data.installation_difficulty,
    products_data.dimensions,
    products_data.material,
    products_data.finish,
    products_data.color,
    products_data.usage_area,
    true as is_active,
    products_data.image_url
FROM categories c
CROSS JOIN (VALUES
    -- MDF ECONOMIC RANGE (45-89 RON)
    ('Panou Riflaj MDF Clasic Stejar Natural', 'panou-riflaj-mdf-clasic-stejar-natural',
     'Panou decorativ MDF cu caneluri clasice, finisaj stejar natural pentru amenajări economice.',
     45.90, 'Set', 'MDF-001', 'MDF', 12.0, 33.0, 2800.0, 'decorativ',
     'Mat', 'lipire', 'vertical', 'stejar', 'MDF 18mm', NULL,
     'interior', 'Clasic', 0.0924, 2.1, 13.0, 12.0,
     'B-s1,d0', 'E1', 'ușoară', 'Stejar Natural, Stejar Cognac', NULL, false, 'medie',
     'ușoară', '33x2800x12 mm', 'MDF Laminat', 'Mat Stejar', 'Stejar Natural',
     'Living, Dormitor, Birou', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),

    ('Panou Riflaj MDF Basic Nuc Clasic', 'panou-riflaj-mdf-basic-nuc-clasic',
     'Design clasic cu aspect de nuc, ideal pentru proiecte cu buget redus.',
     52.75, 'FloorDreams', 'FD-R101', 'MDF', 12.0, 30.0, 2650.0, 'decorativ',
     'Ultramat', 'lipire', 'ambele', 'nuc', 'MDF 18mm', NULL,
     'interior', 'Basic', 0.0795, 2.0, 15.0, 10.0,
     'B-s1,d0', 'E1', 'ușoară', 'Nuc Clasic, Nuc Închis', NULL, false, 'medie',
     'ușoară', '30x2650x12 mm', 'MDF Basic', 'Ultramat', 'Nuc Clasic',
     'Apartament, Garsonieră', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),

    ('Panou Riflaj MDF Pin Scandinav', 'panou-riflaj-mdf-pin-scandinav',
     'Stil nordic cu aspect de pin, pentru designuri minimaliste și moderne.',
     48.60, 'Nordic Wood', 'NW-P205', 'MDF', 15.0, 40.0, 2400.0, 'decorativ',
     'Forest', 'lipire', 'vertical', 'pin', 'MDF 18mm', NULL,
     'interior', 'Scandinavian', 0.096, 2.3, 20.0, 8.0,
     'B-s1,d0', 'E1', 'ușoară', 'Pin Alb, Pin Natural', NULL, false, 'ridicată',
     'ușoară', '40x2400x15 mm', 'MDF Nordic', 'Forest Pin', 'Pin Scandinav',
     'Nordic Living, Studio', 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=400'),

    -- MDF PREMIUM RANGE (90-150 RON)
    ('Panou Riflaj MDF Premium Stejar Cognac', 'panou-riflaj-mdf-premium-stejar-cognac',
     'Finisaj premium cu textură bogată de stejar cognac, pentru spații exclusive.',
     124.50, 'Egger', 'EG-RF2831', 'MDF', 18.0, 45.0, 2800.0, 'decorativ',
     'Synchro', 'profile montaj', 'ambele', 'stejar', 'MDF Premium 18mm', NULL,
     'interior', 'Premium', 0.126, 3.2, 12.0, 15.0,
     'B-s1,d0', 'E1 Premium', 'ușoară', 'Cognac, Caramel, Maro Închis', NULL, false, 'ridicată',
     'medie', '45x2800x18 mm', 'MDF Premium Synchro', 'Premium Cognac', 'Stejar Cognac',
     'Living Premium, Restaurant', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400'),

    ('Panou Riflaj MDF Dimension Maxi', 'panou-riflaj-mdf-dimension-maxi',
     'Format mare cu caneluri profunde, impact vizual maxim pentru spații generoase.',
     142.90, 'FrontMDF', 'FMD-DIM01', 'MDF', 20.0, 60.0, 2550.0, 'decorativ',
     'Supermat', 'profile montaj', 'vertical', NULL, 'MDF Premium 20mm', NULL,
     'interior', 'DIMENSION MAXI', 0.153, 4.1, 25.0, 18.0,
     'B-s1,d0', 'FSC Certified', 'ușoară', 'Alb Mat, Gri Antracit, Negru', NULL, false, 'ridicată',
     'medie', '60x2550x20 mm', 'MDF DIMENSION', 'Supermat', 'Antracit Premium',
     'Living XL, Spații Comerciale', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'),

    ('Panou Riflaj MDF Space Moderne', 'panou-riflaj-mdf-space-moderne',
     'Design contemporan cu spații geometrice, perfect pentru interioare moderne.',
     98.75, 'FrontMDF', 'FMD-SPC02', 'MDF', 16.0, 35.0, 2750.0, 'decorativ',
     'Mat', 'lipire', 'orizontal', NULL, 'MDF 18mm', NULL,
     'interior', 'SPACE', 0.09625, 2.8, 18.0, 12.0,
     'B-s1,d0', 'E1', 'ușoară', 'Gri Modern, Bej, Alb Pure', NULL, false, 'medie',
     'ușoară', '35x2750x16 mm', 'MDF SPACE', 'Mat Modern', 'Gri Contemporan',
     'Apartament Modern, Loft', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),

    -- ACOUSTIC PANELS RANGE (150-250 RON)
    ('Panou Riflaj Acustic Professional Stejar', 'panou-riflaj-acustic-professional-stejar',
     'Panou acustic premium cu fetru absorbant, ideal pentru studiouri și birouri.',
     189.99, 'Unic Spot', 'US-AC601', 'Acustic', 21.0, 134.0, 2600.0, 'fonoabsorbant',
     'Natural Stejar', 'înșurubare', 'vertical', 'stejar', 'MDF + Fetru 9mm', 'NRC 0.85',
     'interior', 'Acoustic Pro', 0.3484, 5.2, 26.0, 12.0,
     'A2-s1,d0', 'E1 + Recycled Felt', 'ușoară', 'Stejar Natural, Stejar Vintage', 'Fetru Acustic 9mm', false, 'ridicată',
     'avansată', '134x2600x21 mm', 'MDF Acoustic + Fetru', 'Acoustic Natural', 'Stejar Acoustic',
     'Studio, Sală Conferințe, Birou Premium', 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400'),

    ('Panou Riflaj Acustic Compact Tec', 'panou-riflaj-acustic-compact-tec',
     'Format modular 60x60cm pentru instalare flexibilă, proprietăți acustice superioare.',
     156.80, 'Unic Spot', 'US-AC600', 'Acustic', 21.0, 600.0, 600.0, 'fonoabsorbant',
     'Tec Natural', 'înșurubare', 'ambele', 'tec', 'MDF + Fetru 9mm', 'NRC 0.80',
     'interior', 'Acoustic Modular', 0.36, 1.8, 26.0, 12.0,
     'A2-s1,d0', 'E1 + Eco Felt', 'ușoară', 'Tec, Mahon, Wenge', 'Fetru Ecologic 9mm', false, 'ridicată',
     'avansată', '600x600x21 mm', 'MDF Modular + Fetru', 'Tec Acoustic', 'Tec Natural',
     'Home Studio, Podcast Room', 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400'),

    ('Panou Riflaj Acustic Premium Gri Glacier', 'panou-riflaj-acustic-premium-gri-glacier',
     'Culoare modernă gri glacier cu performanțe acustice excepționale.',
     198.45, 'Premium Acoustics', 'PA-GL245', 'Acustic', 22.0, 245.0, 2650.0, 'fonoabsorbant',
     'Gri Glacier', 'înșurubare', 'ambele', NULL, 'MDF Premium + Spumă', 'NRC 0.90',
     'interior', 'Glacier Series', 0.6493, 6.8, 30.0, 15.0,
     'A1-s1,d0', 'Green Building Standard', 'ușoară', 'Gri Glacier, Gri Antracit, Negru Mat', 'Spumă Acustică Premium', false, 'ridicată',
     'avansată', '245x2650x22 mm', 'MDF Acoustic Premium', 'Premium Glacier', 'Gri Glacier',
     'Sală Cinema, Studio TV', 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=400'),

    -- SOLID WOOD RANGE (120-300 RON)
    ('Riflaj Lemn Masiv Stejar Natural', 'riflaj-lemn-masiv-stejar-natural',
     'Lemn masiv de stejar cu caneluri naturale, pentru amenajări tradiționale de lux.',
     245.60, 'Premium Wood', 'PW-OAK01', 'Lemn Solid', 20.0, 80.0, 2000.0, 'decorativ',
     'Natural Ulei', 'înșurubare', 'vertical', 'stejar', 'Lemn Masiv Stejar', NULL,
     'interior', 'Solid Classic', 0.16, 8.5, 35.0, 20.0,
     'D-s2,d2', 'FSC 100%', 'intensivă', 'Natural, Rustic, Vintage', NULL, false, 'excelentă',
     'avansată', '80x2000x20 mm', 'Lemn Masiv Stejar', 'Ulei Natural', 'Stejar Masiv',
     'Casa Premium, Cabană Lux', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),

    ('Riflaj Lemn Masiv Nuc European', 'riflaj-lemn-masiv-nuc-european',
     'Nuc european premium cu caneluri adânci, finisaj natural protector.',
     298.90, 'Premium Wood', 'PW-WAL02', 'Lemn Solid', 18.0, 70.0, 2200.0, 'decorativ',
     'Lac Natural', 'înșurubare', 'vertical', 'nuc', 'Lemn Masiv Nuc', NULL,
     'interior', 'European Walnut', 0.154, 9.2, 40.0, 18.0,
     'D-s2,d2', 'FSC 100%', 'intensivă', 'Natural, Cafeniu, Ciocolată', NULL, false, 'excelentă',
     'avansată', '70x2200x18 mm', 'Lemn Masiv Nuc', 'Lac Protector', 'Nuc European',
     'Bibliotecă, Living Premium', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),

    ('Riflaj Lemn Masiv Pin Siberian', 'riflaj-lemn-masiv-pin-siberian',
     'Pin siberian cu aromă naturală, perfect pentru cabane și case rustice.',
     167.30, 'Siberian Wood', 'SW-PIN03', 'Lemn Solid', 16.0, 60.0, 2500.0, 'decorativ',
     'Ceară Naturală', 'înșurubare', 'ambele', 'pin', 'Lemn Masiv Pin', NULL,
     'ambele', 'Rustic Pine', 0.15, 6.8, 25.0, 15.0,
     'D-s2,d2', 'PEFC Certified', 'medie', 'Natural, Miere, Alb Vintage', NULL, true, 'excelentă',
     'medie', '60x2500x16 mm', 'Lemn Masiv Pin', 'Ceară Natural', 'Pin Siberian',
     'Cabană, Terasă, Balcon', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'),

    -- POLYSTYRENE LIGHTWEIGHT RANGE (35-75 RON)
    ('Panou Riflaj Polistiren Vox Linerio Bej', 'panou-riflaj-polistiren-vox-linerio-bej',
     'Panou ușor din polistiren extrudat, instalare rapidă fără scule speciale.',
     59.90, 'Vox Linerio', 'VL-M001', 'Polistiren', 12.0, 122.0, 2650.0, 'decorativ',
     'Bej Mat', 'lipire', 'vertical', NULL, 'Polistiren Extrudat', NULL,
     'interior', 'M-Line', 0.3233, 0.8, 30.0, 8.0,
     'B-s1,d0', 'Recyclabil', 'ușoară', 'Bej, Alb, Gri Deschis', NULL, false, 'ridicată',
     'ușoară', '122x2650x12 mm', 'Polistiren Extrudat', 'Bej Decorativ', 'Bej Modern',
     'Apartament, Dormitor Copii', 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=400'),

    ('Panou Riflaj Polistiren Express Alb', 'panou-riflaj-polistiren-express-alb',
     'Soluție express pentru renovări rapide, greutate redusă și instalare simplă.',
     44.75, 'Express Decor', 'ED-EX401', 'Polistiren', 10.0, 100.0, 2400.0, 'decorativ',
     'Alb Pure', 'lipire', 'ambele', NULL, 'Polistiren Expandat', NULL,
     'interior', 'EXPRESS', 0.24, 0.6, 25.0, 6.0,
     'B-s1,d0', 'Eco-Friendly', 'ușoară', 'Alb Pure, Alb Crem', NULL, false, 'ridicată',
     'ușoară', '100x2400x10 mm', 'Polistiren Express', 'Alb Decorativ', 'Alb Pure',
     'Renovare Rapidă, DIY', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),

    -- MODERN DESIGNER SERIES (100-200 RON)
    ('Panou Riflaj Designer Nova Antracit', 'panou-riflaj-designer-nova-antracit',
     'Colecția Nova cu design geometric modern, culoare antracit pentru accente dramatice.',
     134.80, 'FrontMDF', 'FMD-NOV03', 'MDF', 18.0, 50.0, 2600.0, 'decorativ',
     'Antracit Matt', 'profile montaj', 'vertical', NULL, 'MDF Designer', NULL,
     'interior', 'NOVA', 0.13, 3.5, 22.0, 16.0,
     'B-s1,d0', 'Low VOC', 'ușoară', 'Antracit, Negru Profund, Gri Metalic', NULL, false, 'medie',
     'medie', '50x2600x18 mm', 'MDF Nova Designer', 'Antracit Designer', 'Antracit Modern',
     'Living Modern, Office Premium', 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400'),

    ('Panou Riflaj Designer Inspiro Auriu', 'panou-riflaj-designer-inspiro-auriu',
     'Seria Inspiro cu accente aurii metalice, pentru interioare de lux contemporane.',
     178.50, 'FrontMDF', 'FMD-INS05', 'MDF', 20.0, 45.0, 2750.0, 'decorativ',
     'Auriu Metalic', 'profile montaj', 'ambele', NULL, 'MDF Premium Metallic', NULL,
     'interior', 'INSPIRO', 0.12375, 4.2, 20.0, 18.0,
     'B-s1,d0', 'Luxury Finish', 'medie', 'Auriu, Bronz, Aramiu', NULL, false, 'medie',
     'avansată', '45x2750x20 mm', 'MDF Metallic Premium', 'Auriu Luxury', 'Auriu Metalic',
     'Hotel Luxury, Penthouse', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400'),

    ('Panou Riflaj Designer Surf Ocean', 'panou-riflaj-designer-surf-ocean',
     'Inspirat de valurile oceanului, design fluid pentru spații relaxante.',
     156.90, 'FrontMDF', 'FMD-SRF04', 'MDF', 16.0, 65.0, 2500.0, 'decorativ',
     'Albastru Ocean', 'lipire', 'orizontal', NULL, 'MDF Waterproof', NULL,
     'ambele', 'SURF', 0.1625, 3.8, 32.0, 14.0,
     'B-s1,d0', 'Water Resistant', 'medie', 'Albastru Ocean, Turquoise, Aqua', NULL, true, 'ridicată',
     'medie', '65x2500x16 mm', 'MDF Surf Series', 'Ocean Wave', 'Albastru Ocean',
     'SPA, Baie Premium, Coastal', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'),

    -- SPECIALTY/TECHNICAL PANELS
    ('Panou Riflaj Extern UV Rezistent Tec', 'panou-riflaj-extern-uv-rezistent-tec',
     'Specializat pentru exterior, rezistență UV și intemperii, aspect tec natural.',
     234.70, 'Exterior Pro', 'EP-TEC06', 'MDF Exterior', 22.0, 120.0, 2400.0, 'decorativ',
     'Tec UV-Protect', 'înșurubare', 'vertical', 'tec', 'MDF Exterior Tratat', NULL,
     'exterior', 'UV-Resistant', 0.288, 7.5, 40.0, 20.0,
     'A2-s1,d0', 'Weather Shield', 'medie', 'Tec Natural, Tec Vintage', NULL, true, 'excelentă',
     'avansată', '120x2400x22 mm', 'MDF Exterior Pro', 'UV-Protect Tec', 'Tec Exterior',
     'Fațadă, Terasă, Balcon', 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400'),

    ('Panou Riflaj Ignifug Restaurant Pro', 'panou-riflaj-ignifug-restaurant-pro',
     'Certificat anti-foc pentru restaurante și spații publice, conformitate HORECA.',
     198.60, 'Safety First', 'SF-FR07', 'MDF Ignifug', 25.0, 100.0, 2600.0, 'fonoabsorbant',
     'Stejar Ignifug', 'înșurubare', 'vertical', 'stejar', 'MDF Ignifug A1', 'NRC 0.75',
     'interior', 'Fire-Safe', 0.26, 8.2, 30.0, 15.0,
     'A1-s1,d0', 'HORECA Certified', 'intensivă', 'Stejar, Nuc, Wenge', 'Spumă Ignifugă', false, 'medie',
     'specializată', '100x2600x25 mm', 'MDF Fire-Safe', 'Ignifug Professional', 'Stejar Fire-Safe',
     'Restaurant, Hotel, Spații Publice', 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400'),

    -- BUDGET FRIENDLY OPTIONS
    ('Panou Riflaj Economic Basic Alb', 'panou-riflaj-economic-basic-alb',
     'Soluție economică pentru proiecte cu buget limitat, calitate decentă.',
     34.90, 'Budget Line', 'BL-ECO08', 'MDF', 8.0, 25.0, 2200.0, 'decorativ',
     'Alb Basic', 'lipire', 'vertical', NULL, 'MDF Standard', NULL,
     'interior', 'Economic', 0.055, 1.2, 12.0, 6.0,
     'C-s2,d0', 'Standard', 'ușoară', 'Alb Basic, Bej Basic', NULL, false, 'medie',
     'ușoară', '25x2200x8 mm', 'MDF Economic', 'Basic White', 'Alb Economic',
     'Renovare Buget, Cameră Tineret', 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=400'),

    ('Panou Riflaj DIY Starter Kit', 'panou-riflaj-diy-starter-kit',
     'Kit pentru începători DIY cu instrucțiuni detaliate și accesorii incluse.',
     67.45, 'DIY Master', 'DM-START09', 'MDF', 10.0, 35.0, 2000.0, 'decorativ',
     'Stejar DIY', 'kit complet', 'ambele', 'stejar', 'MDF + Accesorii', NULL,
     'interior', 'Starter Kit', 0.07, 1.8, 15.0, 8.0,
     'B-s2,d0', 'DIY Friendly', 'ușoară', 'Kit: Stejar, Nuc, Pin', NULL, false, 'medie',
     'ușoară', '35x2000x10 mm + Kit', 'MDF DIY + Accesorii', 'DIY Complete', 'Stejar DIY',
     'Proiect DIY, Începători', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),

    -- PREMIUM LUXURY LINE
    ('Panou Riflaj Luxury Edition Wenge', 'panou-riflaj-luxury-edition-wenge',
     'Ediție de lux cu finisaj Wenge exotic, pentru proiecte exclusiviste.',
     345.80, 'Luxury Collection', 'LC-WEN10', 'Lemn Premium', 25.0, 90.0, 2200.0, 'decorativ',
     'Wenge Exotic', 'sistem premium', 'vertical', 'wenge', 'Furnir Wenge + MDF', NULL,
     'interior', 'Luxury Edition', 0.198, 12.5, 45.0, 25.0,
     'D-s1,d0', 'Certified Exotic Wood', 'intensivă', 'Wenge, Zebrano, Ebony', NULL, false, 'excelentă',
     'specializată', '90x2200x25 mm', 'Furnir Exotic Premium', 'Luxury Wenge', 'Wenge Exotic',
     'Yacht, Penthouse, Galerie Artă', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),

    -- CONTEMPORARY COLORS
    ('Panou Riflaj Contemporan Roz Pudră', 'panou-riflaj-contemporan-roz-pudra',
     'Tendință contemporană cu culori pastel, perfect pentru designuri feminine.',
     89.95, 'Trend Colors', 'TC-PINK11', 'MDF', 14.0, 40.0, 2300.0, 'decorativ',
     'Roz Pudră', 'lipire', 'ambele', NULL, 'MDF Color Trend', NULL,
     'interior', 'Contemporary', 0.092, 2.4, 18.0, 12.0,
     'B-s1,d0', 'Non-Toxic Paint', 'ușoară', 'Roz Pudră, Lavanda, Mint', NULL, false, 'medie',
     'ușoară', '40x2300x14 mm', 'MDF Trend Colors', 'Pastel Contemporary', 'Roz Pudră',
     'Dormitor Copii, Beauty Salon', 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=400'),

    ('Panou Riflaj Industrial Copper', 'panou-riflaj-industrial-copper',
     'Design industrial cu aspect de cupru metalic, pentru loft-uri și spații moderne.',
     167.25, 'Industrial Design', 'ID-COP12', 'MDF', 20.0, 75.0, 2400.0, 'decorativ',
     'Cupru Industrial', 'profile montaj', 'orizontal', NULL, 'MDF + Vopsea Metalică', NULL,
     'interior', 'Industrial', 0.18, 5.1, 35.0, 20.0,
     'B-s1,d0', 'Industrial Grade', 'medie', 'Cupru, Bronz Industrial, Fier Oxidat', NULL, false, 'medie',
     'medie', '75x2400x20 mm', 'MDF Industrial', 'Copper Industrial', 'Cupru Metalic',
     'Loft Industrial, Restaurant Urban', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400')

) AS products_data(name, slug, description, price, brand, product_code, panel_type, 
                   panel_thickness_mm, panel_width_mm, panel_length_mm, acoustic_properties,
                   surface_finish_type, mounting_system, panel_orientation, wood_species,
                   base_material, acoustic_rating, installation_area, panel_profile,
                   coverage_per_panel, panel_weight_kg, groove_spacing_mm, groove_depth_mm,
                   fire_resistance_class, environmental_rating, maintenance_type,
                   color_variants, acoustic_backing, uv_resistance, moisture_resistance,
                   installation_difficulty, dimensions, material, finish, color, usage_area, image_url)
WHERE c.slug = 'riflaje'
ON CONFLICT (slug) DO UPDATE SET
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    brand = EXCLUDED.brand;

-- ===================================
-- 4. ADD PERFORMANCE INDEXES
-- ===================================
CREATE INDEX IF NOT EXISTS idx_products_panel_type ON products(panel_type);
CREATE INDEX IF NOT EXISTS idx_products_panel_thickness ON products(panel_thickness_mm);
CREATE INDEX IF NOT EXISTS idx_products_acoustic_properties ON products(acoustic_properties);
CREATE INDEX IF NOT EXISTS idx_products_wood_species ON products(wood_species);
CREATE INDEX IF NOT EXISTS idx_products_base_material ON products(base_material);
CREATE INDEX IF NOT EXISTS idx_products_panel_profile ON products(panel_profile);
CREATE INDEX IF NOT EXISTS idx_products_installation_area ON products(installation_area);

-- ===================================
-- 5. VERIFY DATA INSERTION
-- ===================================
SELECT 
    'CATEGORY INFO' as info,
    c.id::text as value,
    c.name as name,
    c.slug as details
FROM categories c 
WHERE c.slug = 'riflaje'

UNION ALL

SELECT 
    'PRODUCTS COUNT' as info,
    COUNT(*)::text as value,
    'riflaje products total' as name,
    'diverse types and brands' as details
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE c.slug = 'riflaje'

UNION ALL

SELECT 
    'PANEL TYPES' as info,
    COUNT(DISTINCT panel_type)::text as value,
    'different panel types' as name,
    'MDF, Lemn Solid, Polistiren, Acustic' as details
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE c.slug = 'riflaje'

UNION ALL

SELECT 
    'PRICE RANGE' as info,
    CONCAT(MIN(price)::text, ' - ', MAX(price)::text, ' RON') as value,
    'price range' as name,
    'from budget to luxury' as details
FROM products p 
JOIN categories c ON p.category_id = c.id 
WHERE c.slug = 'riflaje';

-- Show sample products for verification
SELECT 
    p.name,
    p.brand,
    p.panel_type,
    p.price,
    p.acoustic_properties,
    p.slug
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'riflaje'
ORDER BY p.panel_type, p.price
LIMIT 15;