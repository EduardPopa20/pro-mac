-- Enhanced Products Schema Migration
-- Adds comprehensive product properties inspired by competitor analysis
-- Execute in Supabase SQL Editor to upgrade products table

-- ===================================
-- 1. ADD NEW COLUMNS TO PRODUCTS TABLE
-- ===================================

-- Brand and identification
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);

-- Technical specifications
ALTER TABLE products ADD COLUMN IF NOT EXISTS thickness DECIMAL(4,1); -- in mm (e.g., 8.5)
ALTER TABLE products ADD COLUMN IF NOT EXISTS surface_finish VARCHAR(100); -- More detailed than finish
ALTER TABLE products ADD COLUMN IF NOT EXISTS texture VARCHAR(100); -- e.g., "Marble-like", "Wood-like"
ALTER TABLE products ADD COLUMN IF NOT EXISTS quality_grade INTEGER DEFAULT 1;

-- Physical properties
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_per_box DECIMAL(6,2); -- in kg
ALTER TABLE products ADD COLUMN IF NOT EXISTS area_per_box DECIMAL(6,2); -- in m2
ALTER TABLE products ADD COLUMN IF NOT EXISTS tiles_per_box INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100);

-- Technical capabilities (boolean flags)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_rectified BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_frost_resistant BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_floor_heating_compatible BOOLEAN DEFAULT false;

-- Application areas (JSON array for multiple areas)
ALTER TABLE products ADD COLUMN IF NOT EXISTS application_areas JSONB DEFAULT '[]';

-- Suitability
ALTER TABLE products ADD COLUMN IF NOT EXISTS suitable_for_walls BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS suitable_for_floors BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS suitable_for_exterior BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS suitable_for_commercial BOOLEAN DEFAULT false;

-- Inventory and pricing
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity DECIMAL(8,2) DEFAULT 0; -- in m2
ALTER TABLE products ADD COLUMN IF NOT EXISTS standard_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS special_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_unit VARCHAR(20) DEFAULT 'mp'; -- mp, buc, cutie

-- Additional details
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_delivery_days INTEGER DEFAULT 3;
ALTER TABLE products ADD COLUMN IF NOT EXISTS installation_notes TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions TEXT;

-- ===================================
-- 2. UPDATE EXISTING COLUMNS CONSTRAINTS
-- ===================================

-- Add check constraints for new numeric fields
ALTER TABLE products ADD CONSTRAINT check_thickness_positive CHECK (thickness IS NULL OR thickness > 0);
ALTER TABLE products ADD CONSTRAINT check_weight_positive CHECK (weight_per_box IS NULL OR weight_per_box > 0);
ALTER TABLE products ADD CONSTRAINT check_area_positive CHECK (area_per_box IS NULL OR area_per_box > 0);
ALTER TABLE products ADD CONSTRAINT check_tiles_positive CHECK (tiles_per_box IS NULL OR tiles_per_box > 0);
ALTER TABLE products ADD CONSTRAINT check_quality_grade_valid CHECK (quality_grade IS NULL OR quality_grade BETWEEN 1 AND 3);
ALTER TABLE products ADD CONSTRAINT check_stock_non_negative CHECK (stock_quantity >= 0);
ALTER TABLE products ADD CONSTRAINT check_delivery_days_positive CHECK (estimated_delivery_days IS NULL OR estimated_delivery_days > 0);

-- ===================================
-- 3. CREATE INDEXES FOR NEW FIELDS
-- ===================================

CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_thickness ON products(thickness);
CREATE INDEX IF NOT EXISTS idx_products_quality_grade ON products(quality_grade);
CREATE INDEX IF NOT EXISTS idx_products_origin_country ON products(origin_country);
CREATE INDEX IF NOT EXISTS idx_products_is_rectified ON products(is_rectified);
CREATE INDEX IF NOT EXISTS idx_products_is_frost_resistant ON products(is_frost_resistant);
CREATE INDEX IF NOT EXISTS idx_products_floor_heating ON products(is_floor_heating_compatible);
CREATE INDEX IF NOT EXISTS idx_products_suitable_walls ON products(suitable_for_walls);
CREATE INDEX IF NOT EXISTS idx_products_suitable_floors ON products(suitable_for_floors);
CREATE INDEX IF NOT EXISTS idx_products_suitable_exterior ON products(suitable_for_exterior);
CREATE INDEX IF NOT EXISTS idx_products_suitable_commercial ON products(suitable_for_commercial);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_application_areas ON products USING gin(application_areas);

-- ===================================
-- 4. SAMPLE ENHANCED DATA
-- ===================================

-- Update existing products with sample enhanced data
-- (Uncomment to populate with test data)
/*
UPDATE products SET 
  brand = 'CERAMAXX PREMIUM',
  product_code = '31326',
  thickness = 8.5,
  surface_finish = 'Glossy',
  texture = 'Marble-like',
  quality_grade = 1,
  weight_per_box = 27.19,
  area_per_box = 1.44,
  origin_country = 'India',
  is_rectified = true,
  is_frost_resistant = true,
  is_floor_heating_compatible = true,
  application_areas = '["Living Room", "Kitchen", "Bathroom", "Commercial Spaces"]',
  suitable_for_walls = true,
  suitable_for_floors = true,
  suitable_for_exterior = true,
  suitable_for_commercial = true,
  stock_quantity = 150.50,
  standard_price = 89.00,
  special_price = 55.90,
  estimated_delivery_days = 3,
  installation_notes = 'Se recomandă utilizarea adezivului special pentru gresie porțelanată.',
  care_instructions = 'Se curăță cu detergent neutru. Se evită produsele abrazive.'
WHERE slug = 'gresie-gri-modern';

UPDATE products SET 
  brand = 'CERAMAXX',
  product_code = '30232',
  thickness = 7.0,
  surface_finish = 'Glossy',
  texture = 'Marble-like',
  quality_grade = 1,
  weight_per_box = 23.98,
  area_per_box = 1.89,
  origin_country = 'Turkey',
  is_rectified = true,
  is_frost_resistant = false,
  is_floor_heating_compatible = true,
  application_areas = '["Bathroom", "Kitchen"]',
  suitable_for_walls = true,
  suitable_for_floors = false,
  suitable_for_exterior = false,
  suitable_for_commercial = false,
  stock_quantity = 53.73,
  standard_price = 101.00,
  special_price = 63.20,
  estimated_delivery_days = 2,
  installation_notes = 'Doar pentru pereți. Se recomandă adeziv specific pentru faianță.',
  care_instructions = 'Se curăță cu detergent neutru pentru suprafețe lucioase.'
WHERE slug = 'faianta-alba-premium';
*/

-- ===================================
-- 5. CREATE VIEW FOR ENHANCED PRODUCT DATA
-- ===================================

-- Create a view that includes all product data with enhanced information
CREATE OR REPLACE VIEW enhanced_products AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug,
  -- Calculated fields
  CASE 
    WHEN p.special_price IS NOT NULL AND p.special_price < p.price THEN p.special_price
    ELSE p.price
  END as current_price,
  CASE 
    WHEN p.special_price IS NOT NULL AND p.special_price < p.price THEN 
      ROUND(((p.price - p.special_price) / p.price * 100)::numeric, 0)
    ELSE 0
  END as discount_percentage,
  -- Stock status
  CASE 
    WHEN p.stock_quantity > 10 THEN 'in_stock'
    WHEN p.stock_quantity > 0 THEN 'limited_stock'
    ELSE 'out_of_stock'
  END as stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Grant permissions on the new view
GRANT SELECT ON enhanced_products TO authenticated;

-- ===================================
-- 6. UPDATE RLS POLICIES FOR NEW VIEW
-- ===================================

-- The enhanced_products view will inherit the RLS policies from the products table
-- No additional policies needed as it's a view

COMMENT ON TABLE products IS 'Enhanced products table with comprehensive tile specifications inspired by industry standards';
COMMENT ON VIEW enhanced_products IS 'Comprehensive view of products with calculated fields and category information';