-- Parchet Database Schema for Pro-Mac E-commerce
-- Based on Dedeman.ro parchet product specifications
-- Execute in Supabase SQL Editor

-- ===================================
-- 1. ADD PARCHET CATEGORY
-- ===================================
-- Insert parchet category if it doesn't exist
INSERT INTO categories (name, description, slug) VALUES
('Parchet', 'Parchet laminat și solid pentru toate încăperile', 'parchet')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===================================
-- 2. ENHANCED PRODUCTS TABLE FOR PARCHET
-- ===================================
-- Add parchet-specific columns to the existing products table
DO $$ 
BEGIN 
    -- Brand (e.g., Egger, Kronotex, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand') THEN
        ALTER TABLE products ADD COLUMN brand VARCHAR(100);
    END IF;
    
    -- Product code/model (e.g., H1061)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'product_code') THEN
        ALTER TABLE products ADD COLUMN product_code VARCHAR(50);
    END IF;
    
    -- Thickness in mm (e.g., 8, 10, 12mm)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'thickness_mm') THEN
        ALTER TABLE products ADD COLUMN thickness_mm DECIMAL(4,1);
    END IF;
    
    -- Traffic class (e.g., "comercial general (cl. 32)")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'traffic_class') THEN
        ALTER TABLE products ADD COLUMN traffic_class VARCHAR(100);
    END IF;
    
    -- Floor type (e.g., "clasic", "vintage", "modern")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'floor_type') THEN
        ALTER TABLE products ADD COLUMN floor_type VARCHAR(100);
    END IF;
    
    -- Installation type (e.g., "sistem CLIC it", "flotant")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'installation_type') THEN
        ALTER TABLE products ADD COLUMN installation_type VARCHAR(100);
    END IF;
    
    -- Width in mm (e.g., 193mm)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'width_mm') THEN
        ALTER TABLE products ADD COLUMN width_mm DECIMAL(8,2);
    END IF;
    
    -- Length in mm (e.g., 1292mm)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'length_mm') THEN
        ALTER TABLE products ADD COLUMN length_mm DECIMAL(8,2);
    END IF;
    
    -- Wood essence/type (e.g., "stejar", "nuc", "brad")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'wood_essence') THEN
        ALTER TABLE products ADD COLUMN wood_essence VARCHAR(100);
    END IF;
    
    -- Collection name (e.g., "Pure Nature", "Classic", "Premium")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'collection_name') THEN
        ALTER TABLE products ADD COLUMN collection_name VARCHAR(100);
    END IF;
    
    -- Core material (e.g., "HDF", "MDF", "Solid Wood")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'core_material') THEN
        ALTER TABLE products ADD COLUMN core_material VARCHAR(100);
    END IF;
    
    -- Surface texture (e.g., "stejar", "netedă", "texturată")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'surface_texture') THEN
        ALTER TABLE products ADD COLUMN surface_texture VARCHAR(100);
    END IF;
    
    -- Total surface per package (e.g., 1.995 m²)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'surface_per_package') THEN
        ALTER TABLE products ADD COLUMN surface_per_package DECIMAL(8,3);
    END IF;
    
    -- Pieces per package (e.g., 8 pieces)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pieces_per_package') THEN
        ALTER TABLE products ADD COLUMN pieces_per_package INTEGER;
    END IF;
    
    -- Installation location (e.g., "HDF swell barrier*")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'installation_location') THEN
        ALTER TABLE products ADD COLUMN installation_location VARCHAR(200);
    END IF;
    
    -- Surface finish (e.g., "stejar")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'surface_finish') THEN
        ALTER TABLE products ADD COLUMN surface_finish VARCHAR(100);
    END IF;
    
    -- Decor pattern (e.g., "H1061")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'decor_pattern') THEN
        ALTER TABLE products ADD COLUMN decor_pattern VARCHAR(100);
    END IF;
    
    -- Format/size description (e.g., "clasic")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'format_description') THEN
        ALTER TABLE products ADD COLUMN format_description VARCHAR(100);
    END IF;
    
    -- Antistatic properties (e.g., "da", "nu")
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_antistatic') THEN
        ALTER TABLE products ADD COLUMN is_antistatic BOOLEAN DEFAULT false;
    END IF;
    
    -- Suitable for underfloor heating
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'underfloor_heating_compatible') THEN
        ALTER TABLE products ADD COLUMN underfloor_heating_compatible VARCHAR(200);
    END IF;
    
    -- Article code from supplier
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'supplier_code') THEN
        ALTER TABLE products ADD COLUMN supplier_code VARCHAR(100);
    END IF;
    
    -- Additional characteristics (suitable areas)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'suitable_areas') THEN
        ALTER TABLE products ADD COLUMN suitable_areas VARCHAR(200);
    END IF;
    
    -- Physical warranty (legal warranty)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'physical_warranty_years') THEN
        ALTER TABLE products ADD COLUMN physical_warranty_years INTEGER;
    END IF;
    
    -- Juridical warranty (legal warranty)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'juridical_warranty_years') THEN
        ALTER TABLE products ADD COLUMN juridical_warranty_years INTEGER;
    END IF;
    
END $$;

-- ===================================
-- 3. INDEXES FOR PERFORMANCE
-- ===================================
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_thickness ON products(thickness_mm);
CREATE INDEX IF NOT EXISTS idx_products_wood_essence ON products(wood_essence);
CREATE INDEX IF NOT EXISTS idx_products_traffic_class ON products(traffic_class);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_name);
CREATE INDEX IF NOT EXISTS idx_products_core_material ON products(core_material);

-- ===================================
-- 4. SAMPLE PARCHET PRODUCTS
-- ===================================
-- Get the parchet category ID
DO $$
DECLARE
    parchet_category_id INTEGER;
BEGIN
    SELECT id INTO parchet_category_id FROM categories WHERE slug = 'parchet';
    
    IF parchet_category_id IS NOT NULL THEN
        -- Insert sample parchet products based on Dedeman specifications
        INSERT INTO products (
            name, slug, description, price, category_id,
            brand, product_code, thickness_mm, traffic_class, floor_type,
            installation_type, width_mm, length_mm, wood_essence, collection_name,
            core_material, surface_texture, surface_per_package, pieces_per_package,
            installation_location, surface_finish, decor_pattern, format_description,
            is_antistatic, underfloor_heating_compatible, supplier_code, suitable_areas,
            physical_warranty_years, juridical_warranty_years, dimensions, material,
            finish, color, usage_area, is_active
        ) VALUES
        (
            'Parchet Laminat Egger Pure Nature Stejar Athense',
            'parchet-laminat-egger-pure-nature-stejar-athense',
            'Parchet laminat de înaltă calitate cu aspect de stejar natural, ideal pentru toate încăperile din casă.',
            89.99,
            parchet_category_id,
            'Egger',                          -- brand
            'H1061',                          -- product_code
            8,                                -- thickness_mm
            'comercial general (cl. 32)',     -- traffic_class
            'clasic',                         -- floor_type
            'sistem CLIC it',                 -- installation_type
            193,                              -- width_mm
            1292,                             -- length_mm
            'stejar',                         -- wood_essence
            'Pure Nature',                    -- collection_name
            'HDF',                            -- core_material
            'stejar',                         -- surface_texture
            1.995,                            -- surface_per_package
            8,                                -- pieces_per_package
            'HDF swell barrier*',             -- installation_location
            'stejar',                         -- surface_finish
            'H1061',                          -- decor_pattern
            'clasic',                         -- format_description
            false,                            -- is_antistatic
            'încălzire termică și electrică în pardoseală', -- underfloor_heating_compatible
            '1802930',                        -- supplier_code
            'zone rezidențiale și comerciale', -- suitable_areas
            240,                              -- physical_warranty_years (20 years * 12 months)
            60,                               -- juridical_warranty_years (5 years * 12 months)
            '193x1292x8 mm',                  -- dimensions
            'Laminat HDF',                    -- material
            'Mat',                            -- finish
            'Stejar Natural',                 -- color
            'Living, Dormitor, Birou',        -- usage_area
            true                              -- is_active
        ),
        (
            'Parchet Laminat Kronotex Premium Nuc Clasic',
            'parchet-laminat-kronotex-premium-nuc-clasic',
            'Parchet laminat premium cu textură de nuc, clasa 33 pentru trafic intens comercial.',
            124.50,
            parchet_category_id,
            'Kronotex',                       -- brand
            'D3234',                          -- product_code
            10,                               -- thickness_mm
            'comercial intens (cl. 33)',      -- traffic_class
            'premium',                        -- floor_type
            'sistem CLIC Premium',            -- installation_type
            192,                              -- width_mm
            1285,                             -- length_mm
            'nuc',                            -- wood_essence
            'Premium Collection',             -- collection_name
            'HDF',                            -- core_material
            'texturată',                      -- surface_texture
            2.131,                            -- surface_per_package
            9,                                -- pieces_per_package
            'HDF cu barieră de umiditate',    -- installation_location
            'nuc',                            -- surface_finish
            'D3234',                          -- decor_pattern
            'premium',                        -- format_description
            true,                             -- is_antistatic
            'compatibil încălzire în pardoseală', -- underfloor_heating_compatible
            '1805671',                        -- supplier_code
            'zone comerciale și rezidențiale', -- suitable_areas
            300,                              -- physical_warranty_years (25 years * 12 months)
            72,                               -- juridical_warranty_years (6 years * 12 months)
            '192x1285x10 mm',                 -- dimensions
            'Laminat HDF Premium',            -- material
            'Texturat',                       -- finish
            'Nuc Clasic',                     -- color
            'Toate încăperile',               -- usage_area
            true                              -- is_active
        )
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- ===================================
-- 5. CREATE VIEWS FOR EASY QUERYING
-- ===================================

-- View for parchet products with all specifications
CREATE OR REPLACE VIEW parchet_products_detailed AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    -- Calculated fields
    (p.width_mm * p.length_mm / 1000000) as piece_area_m2,
    CASE 
        WHEN p.surface_per_package > 0 AND p.pieces_per_package > 0 
        THEN p.surface_per_package / p.pieces_per_package 
        ELSE NULL 
    END as calculated_piece_area_m2,
    -- Price per m2 if surface_per_package is available
    CASE 
        WHEN p.surface_per_package > 0 
        THEN p.price / p.surface_per_package 
        ELSE NULL 
    END as price_per_m2,
    -- Formatting helpers
    CONCAT(p.width_mm, 'x', p.length_mm, 'x', p.thickness_mm, ' mm') as full_dimensions,
    CONCAT(p.brand, ' ', p.collection_name) as brand_collection,
    -- Search helpers
    CONCAT_WS(' ', p.name, p.brand, p.wood_essence, p.collection_name, p.color) as search_text
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'parchet';

-- ===================================
-- 6. SAMPLE QUERIES FOR TESTING
-- ===================================

-- Sample queries to test the new schema (commented out for production)
/*

-- Get all parchet products with details
SELECT * FROM parchet_products_detailed ORDER BY brand, collection_name;

-- Find parchet by brand
SELECT name, brand, price, price_per_m2 
FROM parchet_products_detailed 
WHERE brand ILIKE '%egger%';

-- Find parchet by wood essence
SELECT name, wood_essence, thickness_mm, price 
FROM parchet_products_detailed 
WHERE wood_essence = 'stejar';

-- Find parchet by traffic class
SELECT name, traffic_class, price, suitable_areas 
FROM parchet_products_detailed 
WHERE traffic_class ILIKE '%comercial%';

-- Price range filtering
SELECT name, brand, price, price_per_m2 
FROM parchet_products_detailed 
WHERE price BETWEEN 50 AND 150;

-- Underfloor heating compatible
SELECT name, brand, underfloor_heating_compatible 
FROM parchet_products_detailed 
WHERE underfloor_heating_compatible IS NOT NULL;

*/

-- ===================================
-- 7. UPDATE FUNCTION FOR CALCULATED FIELDS
-- ===================================

-- Function to automatically calculate piece area when dimensions change
CREATE OR REPLACE FUNCTION update_parchet_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process parchet products
    IF EXISTS (SELECT 1 FROM categories WHERE id = NEW.category_id AND slug = 'parchet') THEN
        -- Update search-friendly slug if name changed
        IF OLD.name IS NULL OR OLD.name != NEW.name THEN
            NEW.slug = LOWER(REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REPLACE(REPLACE(REPLACE(REPLACE(NEW.name, 'ă', 'a'), 'â', 'a'), 'î', 'i'), 'ș', 's'), 
                    '[^a-zA-Z0-9\s]', '', 'g'
                ), 
                '\s+', '-', 'g'
            ));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table for parchet
DROP TRIGGER IF EXISTS parchet_calculated_fields_trigger ON products;
CREATE TRIGGER parchet_calculated_fields_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_parchet_calculated_fields();

-- ===================================
-- 8. GRANT PERMISSIONS
-- ===================================

-- Ensure proper permissions for the new columns and views
GRANT SELECT ON parchet_products_detailed TO authenticated;
GRANT SELECT ON parchet_products_detailed TO anon;