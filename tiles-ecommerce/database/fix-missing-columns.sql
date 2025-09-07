-- Fix Missing Columns in Products Table
-- Execute in Supabase SQL Editor to add missing columns

-- Add is_featured column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add stock_status column if it doesn't exist (used in the edit forms)
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_status VARCHAR(20) DEFAULT 'available' CHECK (stock_status IN ('available', 'out_of_stock', 'discontinued', 'coming_soon'));

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

-- Verify the columns exist by checking the table structure
-- (This query will help you verify the columns were added successfully)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND table_schema = 'public'
    AND column_name IN ('is_featured', 'stock_status', 'image_url')
ORDER BY column_name;