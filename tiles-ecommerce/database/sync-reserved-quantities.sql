-- Function to sync reserved quantities with actual stock_reservations
-- This should be called when stock_reservations are manually deleted or cleaned up
CREATE OR REPLACE FUNCTION sync_reserved_quantities()
RETURNS VOID AS $$
DECLARE
    inventory_record RECORD;
    actual_reserved DECIMAL;
BEGIN
    -- Loop through all inventory records
    FOR inventory_record IN 
        SELECT id, product_id, warehouse_id, quantity_reserved 
        FROM inventory
    LOOP
        -- Calculate actual reserved quantity from stock_reservations
        SELECT COALESCE(SUM(quantity), 0)
        INTO actual_reserved
        FROM stock_reservations 
        WHERE product_id = inventory_record.product_id
        AND warehouse_id = inventory_record.warehouse_id
        AND status = 'active'
        AND expires_at > NOW();
        
        -- Update inventory if different
        IF inventory_record.quantity_reserved != actual_reserved THEN
            UPDATE inventory 
            SET 
                quantity_reserved = actual_reserved,
                quantity_available = quantity_on_hand - actual_reserved,
                updated_at = NOW()
            WHERE id = inventory_record.id;
            
            RAISE NOTICE 'Updated inventory % - product_id: %, reserved: % -> %', 
                inventory_record.id, 
                inventory_record.product_id, 
                inventory_record.quantity_reserved, 
                actual_reserved;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION sync_reserved_quantities TO authenticated;
GRANT EXECUTE ON FUNCTION sync_reserved_quantities TO anon;

-- Also create a convenience function for specific products
CREATE OR REPLACE FUNCTION sync_reserved_quantities_for_product(p_product_id INTEGER)
RETURNS VOID AS $$
DECLARE
    inventory_record RECORD;
    actual_reserved DECIMAL;
BEGIN
    -- Loop through inventory records for specific product
    FOR inventory_record IN 
        SELECT id, product_id, warehouse_id, quantity_reserved 
        FROM inventory 
        WHERE product_id = p_product_id
    LOOP
        -- Calculate actual reserved quantity from stock_reservations
        SELECT COALESCE(SUM(quantity), 0)
        INTO actual_reserved
        FROM stock_reservations 
        WHERE product_id = inventory_record.product_id
        AND warehouse_id = inventory_record.warehouse_id
        AND status = 'active'
        AND expires_at > NOW();
        
        -- Update inventory if different
        UPDATE inventory 
        SET 
            quantity_reserved = actual_reserved,
            quantity_available = quantity_on_hand - actual_reserved,
            updated_at = NOW()
        WHERE id = inventory_record.id;
        
        RAISE NOTICE 'Synced product % inventory % - reserved: % -> %', 
            p_product_id,
            inventory_record.id, 
            inventory_record.quantity_reserved, 
            actual_reserved;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION sync_reserved_quantities_for_product TO authenticated;
GRANT EXECUTE ON FUNCTION sync_reserved_quantities_for_product TO anon;