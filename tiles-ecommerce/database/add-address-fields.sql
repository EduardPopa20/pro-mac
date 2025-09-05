-- ===================================
-- ADD NEW ADDRESS FIELDS TO PROFILES TABLE
-- ===================================
-- This script adds the new structured address fields to the existing profiles table

-- Add the new address columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS county VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS street_address_1 VARCHAR(100),
ADD COLUMN IF NOT EXISTS street_address_2 VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

-- Add comments to document the fields
COMMENT ON COLUMN profiles.county IS 'County/Judet (e.g., București, Ilfov, Cluj)';
COMMENT ON COLUMN profiles.city IS 'City/Localitate (e.g., București, Cluj-Napoca)';
COMMENT ON COLUMN profiles.street_address_1 IS 'Street address line 1 (max 100 chars)';
COMMENT ON COLUMN profiles.street_address_2 IS 'Street address line 2 - optional (max 100 chars)';
COMMENT ON COLUMN profiles.postal_code IS 'Postal code (max 10 chars)';

-- Verify the changes
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('county', 'city', 'street_address_1', 'street_address_2', 'postal_code')
ORDER BY ordinal_position;