-- Remove is_featured property from products table
-- Execute this in Supabase SQL Editor

-- Remove the is_featured column from products table
ALTER TABLE products DROP COLUMN IF EXISTS is_featured;

-- Show table structure to verify removal
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;