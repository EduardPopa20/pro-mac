-- =====================================
-- ORDER MANAGEMENT SCHEMA
-- =====================================
-- Pentru sistemul de comenzi și plăți Pro-Mac Tiles
-- Integrat cu Netopia Payments și sistemul de stocuri

-- Drop existing tables if needed (careful in production!)
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- =====================================
-- ENUM TYPES
-- =====================================

-- Status comandă
CREATE TYPE order_status AS ENUM (
  'draft',           -- Comandă în curs de creare
  'pending_payment', -- Așteaptă plata
  'processing',      -- Plata confirmată, în procesare
  'preparing',       -- Se pregătește pentru livrare
  'shipped',         -- Expediată
  'delivered',       -- Livrată
  'completed',       -- Finalizată
  'cancelled',       -- Anulată
  'refunded'        -- Rambursată
);

-- Status plată
CREATE TYPE payment_status AS ENUM (
  'pending',         -- În așteptare
  'processing',      -- Se procesează
  'confirmed',       -- Confirmată
  'failed',          -- Eșuată
  'cancelled',       -- Anulată de utilizator
  'refunded',        -- Rambursată
  'partially_refunded' -- Rambursată parțial
);

-- Metodă de plată
CREATE TYPE payment_method AS ENUM (
  'card',           -- Card bancar
  'bank_transfer',  -- Transfer bancar
  'cash_on_delivery' -- Ramburs
);

-- =====================================
-- ORDERS TABLE
-- =====================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL, -- Format: ORD-YYYYMMDD-XXXXX
  user_id UUID REFERENCES auth.users(id),
  
  -- Date client (pentru comenzi guest)
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  
  -- Adrese
  billing_address JSONB NOT NULL, -- {street, city, county, postal_code, country}
  shipping_address JSONB NOT NULL,
  
  -- Totals (în RON, toate valorile în bani - *100)
  subtotal INTEGER NOT NULL DEFAULT 0, -- Total fără TVA
  tax_amount INTEGER NOT NULL DEFAULT 0, -- TVA
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL, -- Total final
  
  -- Status și tracking
  status order_status NOT NULL DEFAULT 'draft',
  payment_method payment_method,
  
  -- Metadata
  notes TEXT,
  internal_notes TEXT, -- Note interne pentru admin
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_totals CHECK (
    subtotal >= 0 AND
    tax_amount >= 0 AND
    shipping_cost >= 0 AND
    discount_amount >= 0 AND
    total_amount >= 0
  ),
  CONSTRAINT valid_email CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes pentru performanță
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- =====================================
-- ORDER ITEMS TABLE
-- =====================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  
  -- Snapshot date produs la momentul comenzii
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  product_image_url TEXT,
  
  -- Cantitate și preț
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- Preț unitar în bani (*100)
  total_price INTEGER NOT NULL, -- quantity * unit_price
  
  -- Pentru produse care se vând la m²
  sqm_per_unit DECIMAL(10,4),
  total_sqm DECIMAL(10,4),
  
  -- Rezervare stoc asociată
  stock_reservation_id UUID REFERENCES stock_reservations(id),
  
  -- Metadata
  attributes JSONB, -- Culoare, dimensiune, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_prices CHECK (unit_price >= 0 AND total_price >= 0)
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================
-- ORDER PAYMENTS TABLE
-- =====================================
CREATE TABLE order_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Detalii tranzacție
  transaction_id VARCHAR(100) UNIQUE, -- ID extern de la Netopia
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Sume (în bani *100)
  amount INTEGER NOT NULL,
  refunded_amount INTEGER DEFAULT 0,
  
  -- Date gateway plată
  gateway_response JSONB, -- Răspuns complet de la Netopia
  gateway_status VARCHAR(50), -- Status specific Netopia
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Signature pentru verificare
  signature_sent TEXT,
  signature_received TEXT,
  
  -- IPN/Webhook data
  ipn_url TEXT,
  return_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_refund CHECK (refunded_amount >= 0 AND refunded_amount <= amount)
);

-- Indexes
CREATE INDEX idx_order_payments_order_id ON order_payments(order_id);
CREATE INDEX idx_order_payments_transaction_id ON order_payments(transaction_id);
CREATE INDEX idx_order_payments_status ON order_payments(status);

-- =====================================
-- ORDER STATUS HISTORY TABLE
-- =====================================
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Schimbare status
  old_status order_status,
  new_status order_status NOT NULL,
  
  -- Cine și când
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Detalii
  reason TEXT,
  notes TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT
);

-- Index pentru performanță
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at DESC);

-- =====================================
-- TRIGGERS
-- =====================================

-- Trigger pentru actualizare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_payments_updated_at 
  BEFORE UPDATE ON order_payments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pentru generare număr comandă
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  v_date_part VARCHAR(8);
  v_sequence INTEGER;
  v_order_number VARCHAR(20);
BEGIN
  -- Format: ORD-YYYYMMDD-XXXXX
  v_date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Găsește următorul număr de secvență pentru ziua curentă
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 14) AS INTEGER)), 0) + 1
  INTO v_sequence
  FROM orders
  WHERE order_number LIKE 'ORD-' || v_date_part || '-%';
  
  -- Generează numărul comenzii
  v_order_number := 'ORD-' || v_date_part || '-' || LPAD(v_sequence::TEXT, 5, '0');
  
  NEW.order_number := v_order_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Trigger pentru istoric status
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Doar dacă status-ul s-a schimbat
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by,
      reason
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      CASE 
        WHEN NEW.status = 'cancelled' THEN 'Comandă anulată'
        WHEN NEW.status = 'refunded' THEN 'Plată rambursată'
        WHEN NEW.status = 'delivered' THEN 'Comandă livrată'
        ELSE 'Status actualizat'
      END
    );
    
    -- Actualizează timestamp-uri specifice
    CASE NEW.status
      WHEN 'cancelled' THEN NEW.cancelled_at := NOW();
      WHEN 'delivered' THEN NEW.delivered_at := NOW();
      WHEN 'shipped' THEN NEW.shipped_at := NOW();
      ELSE NULL;
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_order_status_change_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();

-- =====================================
-- ROW LEVEL SECURITY
-- =====================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Policies pentru ORDERS
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL -- Pentru comenzi guest
  );

CREATE POLICY "Only admins can update orders" ON orders
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Only admins can delete orders" ON orders
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Policies pentru ORDER_ITEMS
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR 
           auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
    )
  );

CREATE POLICY "Users can create order items for own orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Policies pentru ORDER_PAYMENTS
CREATE POLICY "Users can view own payments" ON order_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_payments.order_id 
      AND (orders.user_id = auth.uid() OR 
           auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
    )
  );

-- Only system/admin can create/update payments
CREATE POLICY "Only system can manage payments" ON order_payments
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- Policies pentru ORDER_STATUS_HISTORY
CREATE POLICY "Users can view own order history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND (orders.user_id = auth.uid() OR 
           auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
    )
  );

-- =====================================
-- HELPER FUNCTIONS
-- =====================================

-- Funcție pentru calculare totale comandă
CREATE OR REPLACE FUNCTION calculate_order_totals(p_order_id UUID)
RETURNS TABLE (
  subtotal INTEGER,
  tax_amount INTEGER,
  total_amount INTEGER
) AS $$
DECLARE
  v_subtotal INTEGER;
  v_tax_rate DECIMAL(5,2) := 0.19; -- TVA 19%
BEGIN
  -- Calculează subtotal din order_items
  SELECT COALESCE(SUM(total_price), 0)
  INTO v_subtotal
  FROM order_items
  WHERE order_id = p_order_id;
  
  -- Calculează TVA
  subtotal := v_subtotal;
  tax_amount := ROUND(v_subtotal * v_tax_rate);
  total_amount := v_subtotal + tax_amount;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Funcție pentru verificare disponibilitate stoc
CREATE OR REPLACE FUNCTION check_order_stock_availability(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_available BOOLEAN := TRUE;
  v_item RECORD;
BEGIN
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    -- Verifică stocul disponibil
    IF NOT EXISTS (
      SELECT 1 
      FROM inventory i
      WHERE i.product_id = v_item.product_id
      AND i.quantity_available >= v_item.quantity
    ) THEN
      v_available := FALSE;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN v_available;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- VIEWS PENTRU RAPORTARE
-- =====================================

-- View pentru comenzi cu detalii complete
CREATE OR REPLACE VIEW order_details_view AS
SELECT 
  o.*,
  p.full_name as customer_full_name,
  COALESCE(
    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id),
    0
  ) as item_count,
  COALESCE(
    (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id),
    0
  ) as total_items,
  pay.status as payment_status,
  pay.transaction_id as payment_transaction_id
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN LATERAL (
  SELECT status, transaction_id 
  FROM order_payments 
  WHERE order_id = o.id 
  ORDER BY created_at DESC 
  LIMIT 1
) pay ON true;

-- Grant permissions pentru view
GRANT SELECT ON order_details_view TO authenticated;

-- =====================================
-- SAMPLE DATA pentru testing (opțional)
-- =====================================
-- Decomentează pentru a insera date de test

/*
-- Comandă de test
INSERT INTO orders (
  user_id,
  customer_email,
  customer_phone,
  customer_name,
  billing_address,
  shipping_address,
  subtotal,
  tax_amount,
  shipping_cost,
  discount_amount,
  total_amount,
  status,
  payment_method
) VALUES (
  auth.uid(),
  'test@example.com',
  '0700000000',
  'Test Customer',
  '{"street": "Strada Test 1", "city": "București", "county": "București", "postal_code": "010101", "country": "România"}',
  '{"street": "Strada Test 1", "city": "București", "county": "București", "postal_code": "010101", "country": "România"}',
  10000, -- 100 RON
  1900,  -- 19 RON TVA
  500,   -- 5 RON transport
  0,
  12400, -- 124 RON total
  'pending_payment',
  'card'
);
*/

-- =====================================
-- INDEXURI ADIȚIONALE PENTRU PERFORMANȚĂ
-- =====================================
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_payments_order_status ON order_payments(order_id, status);

-- =====================================
-- COMENTARII PENTRU DOCUMENTARE
-- =====================================
COMMENT ON TABLE orders IS 'Tabel principal pentru comenzi clienți';
COMMENT ON TABLE order_items IS 'Produse din fiecare comandă cu snapshot preț';
COMMENT ON TABLE order_payments IS 'Tranzacții de plată asociate comenzilor';
COMMENT ON TABLE order_status_history IS 'Istoric modificări status comenzi';
COMMENT ON COLUMN orders.total_amount IS 'Total în bani (RON * 100) - pentru evitare erori virgulă mobilă';
COMMENT ON COLUMN order_payments.transaction_id IS 'ID unic tranzacție de la gateway-ul de plată (Netopia)';