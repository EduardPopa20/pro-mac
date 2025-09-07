-- Function to release session-based reservations
-- Allows anonymous users to release their own reservations
CREATE OR REPLACE FUNCTION release_session_reservation(
    p_reservation_id UUID,
    p_cart_session_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_released_qty DECIMAL;
    v_product_id INTEGER;
    v_warehouse_id UUID;
BEGIN
    -- Get reservation details and release it
    UPDATE stock_reservations 
    SET status = 'released', 
        released_at = NOW()
    WHERE id = p_reservation_id 
    AND cart_session_id = p_cart_session_id
    AND status = 'active'
    RETURNING quantity, product_id, warehouse_id 
    INTO v_released_qty, v_product_id, v_warehouse_id;
    
    -- If we found and released the reservation, update inventory
    IF v_released_qty IS NOT NULL THEN
        UPDATE inventory
        SET quantity_reserved = quantity_reserved - v_released_qty
        WHERE product_id = v_product_id 
        AND warehouse_id = v_warehouse_id;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION release_session_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION release_session_reservation TO anon;