-- Fixed reserve_stock function with better error handling and debugging
CREATE OR REPLACE FUNCTION reserve_stock(
    p_product_id INTEGER,
    p_warehouse_id UUID,
    p_quantity DECIMAL,
    p_user_id UUID,
    p_order_id UUID DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT 15
)
RETURNS UUID AS $$
DECLARE
    v_reservation_id UUID;
    v_inventory_id UUID;
    v_available DECIMAL;
    v_on_hand DECIMAL;
    v_reserved DECIMAL;
BEGIN
    -- Try to find the inventory record
    SELECT id, quantity_on_hand, quantity_reserved, quantity_available 
    INTO v_inventory_id, v_on_hand, v_reserved, v_available
    FROM inventory
    WHERE product_id = p_product_id 
    AND warehouse_id = p_warehouse_id
    FOR UPDATE;
    
    -- If no inventory record exists, create one with 0 quantities
    IF v_inventory_id IS NULL THEN
        INSERT INTO inventory (
            product_id, 
            warehouse_id, 
            quantity_on_hand, 
            quantity_reserved
        ) VALUES (
            p_product_id, 
            p_warehouse_id, 
            0, 
            0
        ) RETURNING id, quantity_on_hand, quantity_reserved, quantity_available
        INTO v_inventory_id, v_on_hand, v_reserved, v_available;
        
        RAISE NOTICE 'Created new inventory record for product % in warehouse %', p_product_id, p_warehouse_id;
    END IF;
    
    -- Log the values for debugging
    RAISE NOTICE 'Inventory check - Product: %, Warehouse: %, On Hand: %, Reserved: %, Available: %, Requested: %', 
        p_product_id, p_warehouse_id, v_on_hand, v_reserved, v_available, p_quantity;
    
    -- Check availability with detailed error message
    IF v_available IS NULL OR v_available < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock available for product % in warehouse %: Available=%, Reserved=%, OnHand=%, Requested=%', 
            p_product_id, p_warehouse_id, COALESCE(v_available, 0), COALESCE(v_reserved, 0), COALESCE(v_on_hand, 0), p_quantity;
    END IF;
    
    -- Create reservation
    INSERT INTO stock_reservations (
        product_id, 
        warehouse_id, 
        quantity, 
        user_id, 
        order_id, 
        expires_at, 
        status
    ) VALUES (
        p_product_id, 
        p_warehouse_id, 
        p_quantity,
        p_user_id, 
        p_order_id, 
        NOW() + (p_duration_minutes || ' minutes')::INTERVAL,
        'active'
    ) RETURNING id INTO v_reservation_id;
    
    -- Update inventory reserved quantity
    UPDATE inventory
    SET quantity_reserved = quantity_reserved + p_quantity,
        updated_at = NOW()
    WHERE id = v_inventory_id;
    
    -- Log movement (only if stock_movements table exists)
    BEGIN
        INSERT INTO stock_movements (
            movement_type, 
            product_id, 
            from_warehouse_id,
            quantity, 
            performed_by, 
            reason, 
            status
        ) VALUES (
            'reservation', 
            p_product_id, 
            p_warehouse_id,
            -p_quantity, 
            p_user_id, 
            'Stock reserved', 
            'completed'
        );
    EXCEPTION 
        WHEN undefined_table THEN
            -- Ignore if stock_movements table doesn't exist
            RAISE NOTICE 'stock_movements table not found, skipping movement log';
    END;
    
    RAISE NOTICE 'Successfully created reservation % for product % (quantity: %)', v_reservation_id, p_product_id, p_quantity;
    
    RETURN v_reservation_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the actual error for debugging
        RAISE EXCEPTION 'reserve_stock failed: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reserve_stock TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock TO anon;

-- Comment
COMMENT ON FUNCTION reserve_stock IS 'Reserves stock for a user/order with automatic expiry - Enhanced with better error handling';