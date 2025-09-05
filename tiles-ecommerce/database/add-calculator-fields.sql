-- Migration: Add calculator-specific fields to products table
-- This adds fields needed for the product calculators based on PDF analysis

-- Add area_per_box if not exists (coverage in m² per box)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS area_per_box DECIMAL(10,3);

-- Add tiles_per_box if not exists (number of pieces per box)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tiles_per_box INTEGER;

-- Add dimensions if not exists (format: "60x120" for 60cm x 120cm)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(50);

-- Add specifications JSONB column for flexible calculator data
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

-- Update existing products with default values based on category
-- This is a sample - adjust based on your actual data

-- Update gresie products with typical values
UPDATE products p
SET 
  area_per_box = CASE 
    WHEN dimensions = '60x120' THEN 1.44  -- 2 tiles of 0.72m² each
    WHEN dimensions = '60x60' THEN 1.44   -- 4 tiles of 0.36m² each
    WHEN dimensions = '30x60' THEN 1.44   -- 8 tiles of 0.18m² each
    WHEN dimensions = '45x45' THEN 1.62   -- 8 tiles of 0.2025m² each
    ELSE 1.44  -- Default
  END,
  tiles_per_box = CASE 
    WHEN dimensions = '60x120' THEN 2
    WHEN dimensions = '60x60' THEN 4
    WHEN dimensions = '30x60' THEN 8
    WHEN dimensions = '45x45' THEN 8
    ELSE 6  -- Default
  END,
  specifications = jsonb_build_object(
    'coverage_per_box', area_per_box,
    'pieces_per_box', tiles_per_box,
    'calculator_enabled', true
  )
WHERE EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.id = p.category_id 
  AND c.slug = 'gresie'
)
AND area_per_box IS NULL;

-- Update faianta products with typical values
UPDATE products p
SET 
  area_per_box = CASE 
    WHEN dimensions = '30x60' THEN 1.44   -- 8 tiles
    WHEN dimensions = '25x50' THEN 1.50   -- 12 tiles
    WHEN dimensions = '20x40' THEN 1.28   -- 16 tiles
    WHEN dimensions = '25x40' THEN 1.50   -- 15 tiles
    ELSE 1.30  -- Default
  END,
  tiles_per_box = CASE 
    WHEN dimensions = '30x60' THEN 8
    WHEN dimensions = '25x50' THEN 12
    WHEN dimensions = '20x40' THEN 16
    WHEN dimensions = '25x40' THEN 15
    ELSE 10  -- Default
  END,
  specifications = jsonb_build_object(
    'coverage_per_box', area_per_box,
    'pieces_per_box', tiles_per_box,
    'calculator_enabled', true
  )
WHERE EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.id = p.category_id 
  AND c.slug = 'faianta'
)
AND area_per_box IS NULL;

-- Update parchet products with typical values
UPDATE products p
SET 
  area_per_box = CASE 
    WHEN name ILIKE '%8mm%' THEN 2.25   -- Typical for 8mm laminate
    WHEN name ILIKE '%10mm%' THEN 1.90  -- Typical for 10mm laminate
    WHEN name ILIKE '%12mm%' THEN 1.65  -- Typical for 12mm laminate
    ELSE 2.00  -- Default
  END,
  specifications = jsonb_build_object(
    'coverage_per_box', area_per_box,
    'planks_per_box', 8,  -- Typical
    'calculator_enabled', true,
    'requires_underlayment', true,
    'requires_skirting', true
  )
WHERE EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.id = p.category_id 
  AND c.slug = 'parchet'
)
AND area_per_box IS NULL;

-- Update riflaje products (decorative trim)
UPDATE products p
SET 
  specifications = jsonb_build_object(
    'linear_meters_per_piece', 2.5,  -- Typical length
    'pieces_per_box', 10,
    'calculator_enabled', true,
    'calculation_type', 'linear'
  )
WHERE EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.id = p.category_id 
  AND c.slug = 'riflaje'
);

-- Add comments for documentation
COMMENT ON COLUMN products.area_per_box IS 'Coverage area in square meters per box - used for calculator';
COMMENT ON COLUMN products.tiles_per_box IS 'Number of tiles/pieces per box - used for calculator';
COMMENT ON COLUMN products.dimensions IS 'Product dimensions in format WIDTHxHEIGHT (e.g., 60x120 for 60cm x 120cm)';
COMMENT ON COLUMN products.specifications IS 'JSON object containing calculator specifications and other flexible product data';

-- Create index on specifications for better query performance
CREATE INDEX IF NOT EXISTS idx_products_specifications 
ON products USING gin (specifications);

-- Sample query to verify the migration
SELECT 
  p.id,
  p.name,
  c.name as category,
  p.dimensions,
  p.area_per_box,
  p.tiles_per_box,
  p.specifications->>'calculator_enabled' as calculator_enabled
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.slug IN ('gresie', 'faianta', 'parchet', 'riflaje')
LIMIT 10;