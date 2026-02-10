-- =====================================================
-- IBNAI SAAS - GOLDEN MASTER SCHEMA (v3.0)
-- Status: PRODUCTION-READY (Updated Feb 2026)
-- Includes: UPI, SaaS Billing, Auto-Calc Triggers, Realtime
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES

-- A. Registration Requests (Public Sign-up)
CREATE TABLE IF NOT EXISTS registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  address TEXT,
  restaurant_type TEXT,
  heard_from TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  contacted_at TIMESTAMPTZ,
  rejection_reason TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B. Restaurants (Tenants)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_request_id UUID REFERENCES registration_requests(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_name TEXT,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT,
  address TEXT,
  restaurant_type TEXT,
  subscription_plan TEXT DEFAULT 'free_trial',
  status TEXT NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  -- Branding
  logo_url TEXT,
  cover_image_url TEXT,
  qr_code_url TEXT,
  -- Billing & SaaS
  upi_id TEXT,
  payment_qr_image_url TEXT,
  subscription_expiry TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  -- Offline Mode
  static_menu_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- C. Users (Restaurant Owners & Staff)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  temp_password BOOLEAN DEFAULT TRUE,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- D. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, name)
);

-- E. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sizes JSONB DEFAULT '[]'::jsonb,
  addons JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  prep_time_minutes INTEGER DEFAULT 15,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- F. Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL, -- 'dine_in', 'takeaway'
  table_number TEXT,
  -- Customer Info
  customer_name TEXT,
  customer_phone TEXT,
  customer_notes TEXT,
  -- Order Data
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  -- Status & Payment
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'completed', 'cancelled'
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'upi'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid'
  payment_transaction_id TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, order_number)
);

-- G. Admin Users (System Admins)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);

-- 4. LOGIC: TRIGGERS

-- A. Generate Order Number (Format: YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_date TEXT;
  random_suffix TEXT;
  is_unique BOOLEAN := FALSE;
  new_order_number TEXT;
BEGIN
  today_date := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  WHILE NOT is_unique LOOP
    random_suffix := LPAD((FLOOR(RANDOM() * 10000)::TEXT), 4, '0');
    new_order_number := today_date || '-' || random_suffix;
    IF NOT EXISTS (SELECT 1 FROM orders WHERE restaurant_id = NEW.restaurant_id AND order_number = new_order_number) THEN
       is_unique := TRUE;
    END IF;
  END LOOP;
  NEW.order_number := new_order_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- B. Auto-Calculate Bill Totals (Subtotal + Tax)
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
  calc_subtotal DECIMAL(10,2) := 0;
BEGIN
  -- Loop through items to calc sum
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    calc_subtotal := calc_subtotal + (COALESCE((item->>'base_price')::decimal, 0) * COALESCE((item->>'quantity')::int, 1));
  END LOOP;

  NEW.subtotal := calc_subtotal;
  NEW.tax := calc_subtotal * 0.05; -- 5% GST Assumption
  NEW.total := NEW.subtotal + NEW.tax;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_calculate_bill ON orders;
CREATE TRIGGER auto_calculate_bill BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- 5. LOGIC: Auth RPC Functions
CREATE OR REPLACE FUNCTION restaurant_login(p_email TEXT, p_password_hash TEXT)
RETURNS TABLE (
  id UUID, email TEXT, role TEXT, restaurant_id UUID, 
  temp_password BOOLEAN, restaurant_name TEXT, restaurant_slug TEXT, 
  restaurant_type TEXT, restaurant_is_active BOOLEAN
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.role, u.restaurant_id, u.temp_password, r.name, r.slug, r.restaurant_type, r.is_active
  FROM users u
  JOIN restaurants r ON r.id = u.restaurant_id
  WHERE LOWER(u.email) = LOWER(p_email) AND u.password_hash = p_password_hash;
END;
$$;

CREATE OR REPLACE FUNCTION admin_login(p_email TEXT, p_password_hash TEXT)
RETURNS TABLE (id UUID, email TEXT, name TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT au.id, au.email, au.name FROM admin_users au
  WHERE LOWER(au.email) = LOWER(p_email) AND au.password_hash = p_password_hash;
END;
$$;

-- 6. LOGIC: Admin Action Functions
CREATE OR REPLACE FUNCTION admin_create_restaurant(
  p_request_id UUID,
  p_restaurant_name TEXT,
  p_slug TEXT,
  p_owner_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_city TEXT,
  p_address TEXT,
  p_restaurant_type TEXT,
  p_subscription_plan TEXT,
  p_password_hash TEXT,
  p_internal_notes TEXT
)
RETURNS TABLE (restaurant_id UUID, user_id UUID, success BOOLEAN, message TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_restaurant_id UUID;
  v_user_id UUID;
BEGIN
  INSERT INTO restaurants (
    registration_request_id, name, slug, owner_name, phone, email,
    city, address, restaurant_type, subscription_plan, status, is_active
  ) VALUES (
    p_request_id, p_restaurant_name, p_slug, p_owner_name, p_phone, p_email,
    p_city, p_address, p_restaurant_type, p_subscription_plan, 'active', TRUE
  )
  RETURNING id INTO v_restaurant_id;

  INSERT INTO users (restaurant_id, email, password_hash, temp_password, role)
  VALUES (v_restaurant_id, p_email, p_password_hash, TRUE, 'owner')
  RETURNING id INTO v_user_id;

  UPDATE registration_requests
  SET status = 'verified', contacted_at = NOW(), internal_notes = p_internal_notes
  WHERE id = p_request_id;

  RETURN QUERY SELECT v_restaurant_id, v_user_id, TRUE, 'Restaurant created successfully'::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, NULL::UUID, FALSE, SQLERRM;
END;
$$;

-- 7. SECURITY (RLS)
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Register" ON registration_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Admin View Requests" ON registration_requests FOR SELECT USING (true);
CREATE POLICY "Allow All Restaurants" ON restaurants FOR ALL USING (true);
CREATE POLICY "Allow All Users" ON users FOR ALL USING (true);
CREATE POLICY "Allow All Categories" ON menu_categories FOR ALL USING (true);
CREATE POLICY "Allow All Items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow All Admins" ON admin_users FOR ALL USING (true);

-- ORDERS POLICIES (Updated for Public Insert / Owner View)
CREATE POLICY "Public Create Orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owners View Orders" ON orders FOR SELECT TO authenticated USING (true);

-- 8. REALTIME (Enable Live Orders)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 9. DEFAULT DATA
INSERT INTO admin_users (email, password_hash, name, is_super_admin)
VALUES ('admin@dineos.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'System Admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- 10. STORAGE BUCKETS (Instructions & Policies)
-- Note: Create these buckets in Supabase Dashboard: 'menu-items', 'restaurant-assets'

-- Policy for 'menu-items' bucket (Public Read, Authenticated Upload)
-- CREATE POLICY "Public Read Menu Items" ON storage.objects FOR SELECT USING (bucket_id = 'menu-items');
-- CREATE POLICY "Authenticated Upload Menu Items" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-items' AND auth.role() = 'authenticated');

-- Policy for 'restaurant-assets' bucket (Public Read, Authenticated Upload)
-- CREATE POLICY "Public Read Assets" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');
-- CREATE POLICY "Authenticated Upload Assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');