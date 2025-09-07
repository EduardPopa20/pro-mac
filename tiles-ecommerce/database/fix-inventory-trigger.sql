-- Fix the inventory trigger to use correct column names
-- This fixes the conflict between old admin-schema and new stock-management-schema

-- Drop the old trigger that uses wrong column names
DROP TRIGGER IF EXISTS create_inventory_on_product_insert ON products;
DROP FUNCTION IF EXISTS create_inventory_for_product();

-- Create new function with correct column names
CREATE OR REPLACE FUNCTION create_inventory_for_product()
RETURNS TRIGGER AS $$
DECLARE
    v_warehouse_id UUID;
BEGIN
    -- Get the default warehouse
    SELECT id INTO v_warehouse_id
    FROM warehouses
    WHERE is_default = true
    LIMIT 1;
    
    -- Only create inventory record if we have a default warehouse
    IF v_warehouse_id IS NOT NULL THEN
        INSERT INTO inventory (
            product_id, 
            warehouse_id,
            quantity_on_hand,
            quantity_reserved,
            pieces_per_box,
            sqm_per_box
        )
        VALUES (
            NEW.id, 
            v_warehouse_id,
            0,  -- Start with 0 stock
            0,  -- No reservations
            COALESCE(NEW.tiles_per_box, 1),
            COALESCE(NEW.area_per_box, 1)
        )
        ON CONFLICT (product_id, warehouse_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the fixed function
CREATE TRIGGER create_inventory_on_product_insert 
  AFTER INSERT ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION create_inventory_for_product();

-- Also ensure the warehouse exists
INSERT INTO warehouses (code, name, type, address, city, county, is_default, is_active)
VALUES ('WH-MAIN', 'Depozit Principal', 'warehouse', 'Str. Industriilor Nr. 10', 'București', 'București', true, true)
ON CONFLICT (code) DO UPDATE SET is_default = true, is_active = true;