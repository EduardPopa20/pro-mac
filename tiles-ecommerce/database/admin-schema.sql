-- Admin Dashboard Database Schema for Pro-Mac E-commerce
-- Execute these commands in your Supabase SQL Editor

-- ===================================
-- 1. SITE SETTINGS TABLE
-- ===================================
-- Stores global configuration values that can be modified from admin dashboard
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO site_settings (key, value, description) VALUES
('whatsapp_phone', '0729926085', 'Numărul de telefon pentru WhatsApp (format: 0729926085)'),
('company_name', 'Pro-Mac', 'Numele companiei afișat în aplicație'),
('company_email', 'contact@promac.ro', 'Email-ul oficial al companiei'),
('company_address', 'Strada Principală Nr. 123, București', 'Adresa principală a companiei')
ON CONFLICT (key) DO NOTHING;

-- ===================================
-- 2. PRODUCT CATEGORIES
-- ===================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default categories for tiles
INSERT INTO categories (name, description, slug) VALUES
('Faianță Baie', 'Faianță pentru amenajarea băilor', 'faianta-baie'),
('Gresie Interior', 'Gresie pentru interior', 'gresie-interior'),
('Gresie Exterior', 'Gresie rezistentă pentru exterior', 'gresie-exterior'),
('Mozaic', 'Mozaic decorativ pentru diverse aplicații', 'mozaic'),
('Accesorii', 'Accesorii și alte produse complementare', 'accesorii')
ON CONFLICT (slug) DO NOTHING;

-- ===================================
-- 3. PRODUCTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  -- Additional product details for tiles
  dimensions VARCHAR(50), -- e.g., "30x60 cm"
  material VARCHAR(100),  -- e.g., "Ceramică", "Porțelan"
  finish VARCHAR(100),    -- e.g., "Mat", "Lucios", "Texturat"
  color VARCHAR(100),     -- e.g., "Alb", "Gri", "Maro"
  usage_area VARCHAR(100), -- e.g., "Baie", "Bucătărie", "Exterior"
  -- Status fields
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ===================================
-- 4. INVENTORY MANAGEMENT
-- ===================================
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  reorder_level INTEGER DEFAULT 10 CHECK (reorder_level >= 0),
  last_restock_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ===================================
-- 5. SHOWROOMS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS showrooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  waze_url TEXT,
  google_maps_url TEXT,
  description TEXT,
  opening_hours TEXT, -- e.g., "L-V: 9:00-18:00, S: 9:00-14:00"
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default showrooms
INSERT INTO showrooms (name, address, city, phone, description) VALUES
('Showroom București', 'Strada Principală Nr. 123, Sector 1', 'București', '021-123-4567', 'Showroom principal cu cea mai variată gamă de produse'),
('Showroom Ploiești', 'Bulevardul Republicii Nr. 45', 'Ploiești', '0244-123456', 'Showroom Ploiești - produse selectate pentru regiunea Prahova')
ON CONFLICT DO NOTHING;

-- ===================================
-- 6. AUDIT LOG FOR ADMIN ACTIONS
-- ===================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
  table_name VARCHAR(50) NOT NULL,
  record_id INTEGER,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ===================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);

-- ===================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ===================================

-- Site Settings: Only admins can modify
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view site_settings" ON site_settings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));
CREATE POLICY "Admins can update site_settings" ON site_settings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Categories: Read by everyone, modify by admins
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active categories" ON categories
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Products: Read by everyone, modify by admins
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active products" ON products
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Inventory: Only admins can access
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Showrooms: Read by everyone, modify by admins
ALTER TABLE showrooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active showrooms" ON showrooms
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));
CREATE POLICY "Admins can manage showrooms" ON showrooms
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Audit Log: Only admins can read
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- ===================================
-- 9. FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_showrooms_updated_at BEFORE UPDATE ON showrooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create inventory record when product is created
CREATE OR REPLACE FUNCTION create_inventory_for_product()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO inventory (product_id, quantity, updated_by)
    VALUES (NEW.id, 0, NEW.created_by);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_inventory_on_product_insert 
  AFTER INSERT ON products 
  FOR EACH ROW 
  EXECUTE PROCEDURE create_inventory_for_product();

-- ===================================
-- 10. SAMPLE DATA (Optional - for testing)
-- ===================================

-- Sample products (uncomment to add test data)
/*
INSERT INTO products (name, slug, description, price, category_id, dimensions, material, finish, color, usage_area) VALUES
('Faianță Albă Premium', 'faianta-alba-premium', 'Faianță albă de înaltă calitate pentru baie', 45.50, 1, '25x40 cm', 'Ceramică', 'Lucios', 'Alb', 'Baie'),
('Gresie Gri Modern', 'gresie-gri-modern', 'Gresie cu aspect modern pentru interior', 65.75, 2, '60x60 cm', 'Porțelan', 'Mat', 'Gri', 'Living'),
('Mozaic Decorativ', 'mozaic-decorativ', 'Mozaic colorat pentru accentuare', 89.99, 4, '30x30 cm', 'Sticlă', 'Lucios', 'Multicolor', 'Bucătărie');
*/

-- Grant necessary permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;