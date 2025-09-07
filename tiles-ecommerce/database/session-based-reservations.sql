-- Function to create session-based stock reservations
-- Supports both authenticated users and anonymous sessions
CREATE OR REPLACE FUNCTION reserve_stock_session(
    p_product_id INTEGER,
    p_warehouse_id UUID,
    p_quantity DECIMAL,
    p_user_id UUID DEFAULT NULL,
    p_cart_session_id TEXT DEFAULT NULL,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS UUID AS $$
DECLARE
    v_reservation_id UUID;
    v_available_qty DECIMAL;
BEGIN
    -- Check if we have at least one identifier (user_id or cart_session_id)
    IF p_user_id IS NULL AND p_cart_session_id IS NULL THEN
        RAISE EXCEPTION 'Either user_id or cart_session_id must be provided';
    END IF;
    
    -- Check stock availability
    SELECT quantity_available 
    INTO v_available_qty
    FROM inventory 
    WHERE product_id = p_product_id 
    AND warehouse_id = p_warehouse_id;
    
    -- Return NULL if not enough stock
    IF COALESCE(v_available_qty, 0) < p_quantity THEN
        RETURN NULL;
    END IF;
    
    -- Create reservation
    INSERT INTO stock_reservations (
        product_id,
        warehouse_id,
        user_id,
        cart_session_id,
        quantity,
        expires_at,
        status
    ) VALUES (
        p_product_id,
        p_warehouse_id,
        p_user_id,
        p_cart_session_id,
        p_quantity,
        NOW() + (p_duration_minutes || ' minutes')::INTERVAL,
        'active'
    )
    RETURNING id INTO v_reservation_id;
    
    -- Update inventory reserved quantity
    UPDATE inventory
    SET quantity_reserved = quantity_reserved + p_quantity
    WHERE product_id = p_product_id 
    AND warehouse_id = p_warehouse_id;
    
    RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reserve_stock_session TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock_session TO anon;