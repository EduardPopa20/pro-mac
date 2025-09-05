-- ============================================
-- STOCK MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================
-- Pro-Mac Tiles E-commerce Platform
-- Version: 1.0
-- Created: January 2025
-- 
-- This migration creates a comprehensive stock management system
-- with support for multi-warehouse, reservations, and audit trails
-- ============================================

-- ============================================
-- 1. WAREHOUSES/LOCATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'warehouse',
    /* Types: 'warehouse', 'showroom', 'supplier', 'transit' */
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    county VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'RO',
    
    -- Contact
    phone VARCHAR(50),
    email VARCHAR(100),
    manager_id UUID REFERENCES auth.users(id),
    
    -- Capabilities
    can_ship BOOLEAN DEFAULT true,
    can_receive BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active warehouses
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(type);
CREATE INDEX IF NOT EXISTS idx_warehouses_city ON warehouses(city);

-- Insert default warehouse
INSERT INTO warehouses (code, name, type, address, city, county, is_default, is_active)
VALUES ('WH-MAIN', 'Depozit Principal', 'warehouse', 'Str. Industriilor Nr. 10', 'București', 'București', true, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 2. ENHANCED INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Stock quantities (all in smallest unit - pieces/tiles)
    quantity_on_hand DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_reserved DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_available DECIMAL(10,2) GENERATED ALWAYS AS 
        (quantity_on_hand - quantity_reserved) STORED,
    
    -- Unit conversions
    pieces_per_box INTEGER NOT NULL DEFAULT 1,
    sqm_per_box DECIMAL(8,4) NOT NULL DEFAULT 1,
    pieces_per_sqm DECIMAL(8,4) GENERATED ALWAYS AS 
        (CASE WHEN sqm_per_box > 0 THEN pieces_per_box / sqm_per_box ELSE 0 END) STORED,
    
    -- Reorder points
    reorder_point DECIMAL(10,2),
    reorder_quantity DECIMAL(10,2),
    max_stock_level DECIMAL(10,2),
    
    -- Location details
    bin_location VARCHAR(50),
    zone VARCHAR(20),
    
    -- Tracking
    last_counted_at TIMESTAMP WITH TIME ZONE,
    last_restock_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(product_id, warehouse_id),
    CHECK (quantity_on_hand >= 0),
    CHECK (quantity_reserved >= 0),
    CHECK (quantity_reserved <= quantity_on_hand)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_warehouse ON inventory(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_available ON inventory(quantity_available) 
    WHERE quantity_available > 0;
CREATE INDEX IF NOT EXISTS idx_inventory_reorder ON inventory(product_id)
    WHERE quantity_available <= reorder_point;

-- ============================================
-- 3. STOCK MOVEMENTS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    movement_type VARCHAR(50) NOT NULL,
    /* Types: 
       'purchase', 'sale', 'return', 'adjustment', 
       'transfer_in', 'transfer_out', 'damage', 
       'count_adjustment', 'reservation', 'release'
    */
    
    -- References
    product_id INTEGER REFERENCES products(id),
    from_warehouse_id UUID REFERENCES warehouses(id),
    to_warehouse_id UUID REFERENCES warehouses(id),
    order_id UUID,
    
    -- Quantities (positive for IN, negative for OUT)
    quantity DECIMAL(10,2) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'piece',
    
    -- Financial
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Batch tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Status and validation
    status VARCHAR(20) DEFAULT 'pending',
    /* Status: 'pending', 'completed', 'cancelled', 'failed' */
    
    -- User tracking
    performed_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    
    -- Notes and reason
    reason VARCHAR(200),
    notes TEXT,
    
    -- Reference to external systems
    external_ref VARCHAR(100),
    external_system VARCHAR(50),
    
    -- Timestamps
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_movement_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movement_date ON stock_movements(movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_movement_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_movement_status ON stock_movements(status);
CREATE INDEX IF NOT EXISTS idx_movement_warehouse ON stock_movements(from_warehouse_id, to_warehouse_id);

-- ============================================
-- 4. STOCK RESERVATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- References
    product_id INTEGER REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    order_id UUID,
    cart_session_id VARCHAR(100),
    
    -- Reservation details
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2),
    
    -- Timing
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',
    /* Status: 'active', 'confirmed', 'released', 'expired' */
    
    -- User reference
    user_id UUID REFERENCES auth.users(id),
    
    -- Constraints
    CHECK (quantity > 0),
    CHECK (expires_at > reserved_at)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_reservations_product ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_reservations_expires ON stock_reservations(expires_at) 
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reservations_status ON stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON stock_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_order ON stock_reservations(order_id);

-- ============================================
-- 5. STOCK ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Alert configuration
    alert_type VARCHAR(50) NOT NULL,
    /* Types: 'low_stock', 'out_of_stock', 'overstock', 'expiring' */
    
    product_id INTEGER REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Thresholds
    threshold_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    
    -- Alert details
    severity VARCHAR(20) DEFAULT 'medium',
    /* Severity: 'low', 'medium', 'high', 'critical' */
    
    message TEXT,
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Timestamps
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_active ON stock_alerts(product_id, is_active) 
    WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_alerts_type ON stock_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON stock_alerts(severity);

-- ============================================
-- 6. BATCH TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stock_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identification
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    product_id INTEGER REFERENCES products(id),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Quantities
    initial_quantity DECIMAL(10,2) NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL,
    
    -- Dates
    manufacture_date DATE,
    expiry_date DATE,
    received_date DATE NOT NULL,
    
    -- Source
    supplier_name VARCHAR(200),
    purchase_order_number VARCHAR(100),
    invoice_number VARCHAR(100),
    
    -- Quality
    quality_check_status VARCHAR(50),
    quality_notes TEXT,
    
    -- Cost
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batches_product ON stock_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_batches_batch_number ON stock_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_batches_status ON stock_batches(status);

-- ============================================
-- 7. DISTRIBUTED LOCKS TABLE (for concurrency)
-- ============================================
CREATE TABLE IF NOT EXISTS distributed_locks (
    resource_id VARCHAR(200) PRIMARY KEY,
    lock_id VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locks_expires ON distributed_locks(expires_at);

-- ============================================
-- 8. CONSTRAINTS AND DATA INTEGRITY
-- ============================================

-- Ensure data integrity for movements
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_movement_type' 
        AND conrelid = 'stock_movements'::regclass
    ) THEN
        ALTER TABLE stock_movements ADD CONSTRAINT valid_movement_type 
            CHECK (movement_type IN ('purchase', 'sale', 'return', 'adjustment', 
                                    'transfer_in', 'transfer_out', 'damage', 
                                    'count_adjustment', 'reservation', 'release'));
    END IF;
END $$;

-- Add version column for optimistic locking
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- ============================================
-- 9. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update inventory timestamp
CREATE OR REPLACE FUNCTION update_inventory_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for inventory updates
DROP TRIGGER IF EXISTS inventory_update_timestamp ON inventory;
CREATE TRIGGER inventory_update_timestamp
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_timestamp();

-- Function to release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
    -- Find all expired active reservations
    WITH expired AS (
        SELECT * FROM stock_reservations
        WHERE status = 'active' 
        AND expires_at < NOW()
        FOR UPDATE
    )
    -- Update inventory for each expired reservation
    UPDATE inventory i
    SET quantity_reserved = i.quantity_reserved - e.quantity
    FROM expired e
    WHERE i.product_id = e.product_id 
    AND i.warehouse_id = e.warehouse_id;
    
    -- Mark reservations as expired
    UPDATE stock_reservations
    SET status = 'expired',
        released_at = NOW()
    WHERE status = 'active' 
    AND expires_at < NOW();
    
    -- Log movements
    INSERT INTO stock_movements (
        movement_type, product_id, from_warehouse_id, 
        quantity, reason, status
    )
    SELECT 
        'release', product_id, warehouse_id,
        quantity, 'Reservation expired', 'completed'
    FROM stock_reservations
    WHERE status = 'expired' 
    AND released_at >= NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Function for optimistic locking update
CREATE OR REPLACE FUNCTION update_inventory_optimistic(
    p_inventory_id UUID,
    p_quantity_change DECIMAL,
    p_expected_version INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    UPDATE inventory
    SET 
        quantity_on_hand = quantity_on_hand + p_quantity_change,
        version = version + 1,
        updated_at = NOW()
    WHERE 
        id = p_inventory_id 
        AND version = p_expected_version
        AND quantity_on_hand + p_quantity_change >= 0;
    
    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    
    RETURN v_updated_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check stock availability
CREATE OR REPLACE FUNCTION check_stock_availability(
    p_product_id INTEGER,
    p_warehouse_id UUID,
    p_quantity DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_available DECIMAL;
BEGIN
    SELECT quantity_available INTO v_available
    FROM inventory
    WHERE product_id = p_product_id 
    AND warehouse_id = p_warehouse_id;
    
    RETURN COALESCE(v_available, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Function to reserve stock
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
BEGIN
    -- Lock the inventory row
    SELECT id, quantity_available INTO v_inventory_id, v_available
    FROM inventory
    WHERE product_id = p_product_id 
    AND warehouse_id = p_warehouse_id
    FOR UPDATE;
    
    -- Check availability
    IF v_available < p_quantity THEN
        RAISE EXCEPTION 'Insufficient stock available: % < %', v_available, p_quantity;
    END IF;
    
    -- Create reservation
    INSERT INTO stock_reservations (
        product_id, warehouse_id, quantity, 
        user_id, order_id, expires_at, status
    ) VALUES (
        p_product_id, p_warehouse_id, p_quantity,
        p_user_id, p_order_id, 
        NOW() + (p_duration_minutes || ' minutes')::INTERVAL,
        'active'
    ) RETURNING id INTO v_reservation_id;
    
    -- Update inventory
    UPDATE inventory
    SET quantity_reserved = quantity_reserved + p_quantity
    WHERE id = v_inventory_id;
    
    -- Log movement
    INSERT INTO stock_movements (
        movement_type, product_id, from_warehouse_id,
        quantity, performed_by, reason, status
    ) VALUES (
        'reservation', p_product_id, p_warehouse_id,
        -p_quantity, p_user_id, 'Stock reserved', 'completed'
    );
    
    RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm reservation (after payment)
CREATE OR REPLACE FUNCTION confirm_stock_reservation(
    p_reservation_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_reservation RECORD;
BEGIN
    -- Get reservation details
    SELECT * INTO v_reservation
    FROM stock_reservations
    WHERE id = p_reservation_id 
    AND status = 'active'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update reservation status
    UPDATE stock_reservations
    SET status = 'confirmed'
    WHERE id = p_reservation_id;
    
    -- Update inventory (convert reserved to sold)
    UPDATE inventory
    SET 
        quantity_on_hand = quantity_on_hand - v_reservation.quantity,
        quantity_reserved = quantity_reserved - v_reservation.quantity
    WHERE product_id = v_reservation.product_id
    AND warehouse_id = v_reservation.warehouse_id;
    
    -- Log sale movement
    INSERT INTO stock_movements (
        movement_type, product_id, from_warehouse_id,
        quantity, order_id, reason, status
    ) VALUES (
        'sale', v_reservation.product_id, v_reservation.warehouse_id,
        -v_reservation.quantity, v_reservation.order_id, 
        'Order confirmed', 'completed'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. VIEWS FOR EASIER QUERIES
-- ============================================

-- Stock summary view
CREATE OR REPLACE VIEW stock_summary AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.slug as product_slug,
    p.price,
    w.id as warehouse_id,
    w.name as warehouse_name,
    w.code as warehouse_code,
    COALESCE(i.quantity_on_hand, 0) as quantity_on_hand,
    COALESCE(i.quantity_reserved, 0) as quantity_reserved,
    COALESCE(i.quantity_available, 0) as quantity_available,
    i.reorder_point,
    i.reorder_quantity,
    i.last_restock_at,
    CASE 
        WHEN i.quantity_available > 0 THEN 'in_stock'
        WHEN i.quantity_on_hand > 0 THEN 'reserved'
        ELSE 'out_of_stock'
    END as stock_status,
    CASE
        WHEN i.quantity_available <= 0 THEN 'critical'
        WHEN i.quantity_available <= i.reorder_point THEN 'low'
        WHEN i.quantity_available > COALESCE(i.max_stock_level, i.quantity_available) THEN 'overstock'
        ELSE 'normal'
    END as stock_level
FROM products p
CROSS JOIN warehouses w
LEFT JOIN inventory i ON p.id = i.product_id AND w.id = i.warehouse_id
WHERE w.is_active = true;

-- Recent movements view
CREATE OR REPLACE VIEW recent_stock_movements AS
SELECT 
    sm.*,
    p.name as product_name,
    fw.name as from_warehouse_name,
    tw.name as to_warehouse_name,
    u.email as performed_by_email
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN warehouses fw ON sm.from_warehouse_id = fw.id
LEFT JOIN warehouses tw ON sm.to_warehouse_id = tw.id
LEFT JOIN auth.users u ON sm.performed_by = u.id
ORDER BY sm.movement_date DESC
LIMIT 100;

-- ============================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;

-- Warehouses policies
CREATE POLICY "Public can view active warehouses" ON warehouses
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage warehouses" ON warehouses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Inventory policies
CREATE POLICY "Public can view inventory" ON inventory
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage inventory" ON inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Stock movements policies
CREATE POLICY "Admins can view all movements" ON stock_movements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can create movements" ON stock_movements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Stock reservations policies
CREATE POLICY "Users can view own reservations" ON stock_reservations
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create reservations" ON stock_reservations
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "System can update reservations" ON stock_reservations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Stock alerts policies
CREATE POLICY "Admins can manage alerts" ON stock_alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Stock batches policies
CREATE POLICY "Public can view batches" ON stock_batches
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage batches" ON stock_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- 12. MIGRATE EXISTING DATA
-- ============================================

-- Get default warehouse ID
DO $$
DECLARE
    v_warehouse_id UUID;
BEGIN
    -- Get the default warehouse
    SELECT id INTO v_warehouse_id
    FROM warehouses
    WHERE is_default = true
    LIMIT 1;
    
    -- Migrate existing stock_quantity from products to inventory
    INSERT INTO inventory (
        product_id, 
        warehouse_id, 
        quantity_on_hand, 
        quantity_reserved,
        pieces_per_box,
        sqm_per_box,
        reorder_point,
        reorder_quantity
    )
    SELECT 
        p.id,
        v_warehouse_id,
        COALESCE(p.stock_quantity, 0),
        0, -- No reservations initially
        COALESCE(p.tiles_per_box, 1),
        COALESCE(p.area_per_box, 1),
        10, -- Default reorder point
        20  -- Default reorder quantity
    FROM products p
    WHERE NOT EXISTS (
        SELECT 1 FROM inventory i 
        WHERE i.product_id = p.id 
        AND i.warehouse_id = v_warehouse_id
    );
END $$;

-- ============================================
-- 13. GRANT PERMISSIONS
-- ============================================

-- Grant usage on all tables to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION check_stock_availability TO authenticated;
GRANT EXECUTE ON FUNCTION reserve_stock TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_stock_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION release_expired_reservations TO authenticated;

-- ============================================
-- 14. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE warehouses IS 'Stores information about warehouses, showrooms, and other stock locations';
COMMENT ON TABLE inventory IS 'Main inventory tracking table with real-time stock levels';
COMMENT ON TABLE stock_movements IS 'Audit trail of all stock movements and transactions';
COMMENT ON TABLE stock_reservations IS 'Temporary stock reservations for orders and carts';
COMMENT ON TABLE stock_alerts IS 'System-generated alerts for stock levels and issues';
COMMENT ON TABLE stock_batches IS 'Batch and lot tracking for incoming stock';
COMMENT ON FUNCTION reserve_stock IS 'Reserves stock for a user/order with automatic expiry';
COMMENT ON FUNCTION confirm_stock_reservation IS 'Confirms a reservation after payment, converting to sale';
COMMENT ON FUNCTION release_expired_reservations IS 'Automatically releases expired reservations';

-- ============================================
-- END OF MIGRATION
-- ============================================