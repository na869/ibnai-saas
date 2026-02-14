-- =====================================================
-- PRODUCTION-READY AUTH & RLS MIGRATION
-- Migration: 20260213000000_production_auth_rls.sql
-- =====================================================

-- 1. CLEANUP OLD AUTH LOGIC
DROP FUNCTION IF EXISTS public.restaurant_login(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_login(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.admin_create_restaurant(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 2. CREATE PROFILES TABLE (Supabase Native Auth Bridge)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'owner', 'staff')),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MIGRATE DATA (If any)
DO $$
BEGIN
    -- Migrate from public.users to public.profiles if public.users exists
    -- Only migrate if the ID exists in auth.users to avoid FK violations
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        INSERT INTO public.profiles (id, email, role, restaurant_id, created_at)
        SELECT u.id, u.email, u.role, u.restaurant_id, u.created_at 
        FROM public.users u
        JOIN auth.users au ON u.id = au.id
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Migrate from admin_users to public.profiles if admin_users exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users' AND table_schema = 'public') THEN
        INSERT INTO public.profiles (id, email, role, full_name, created_at)
        SELECT a.id, a.email, 'admin', a.name, a.created_at 
        FROM public.admin_users a
        JOIN auth.users au ON a.id = au.id
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 4. DROP OLD TABLES
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- 5. RE-IMPLEMENT AUTH SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_restaurant_id UUID;
    v_restaurant_name TEXT;
    v_slug TEXT;
    v_base_slug TEXT;
    v_counter INTEGER := 0;
    v_role TEXT := 'owner';
BEGIN
    -- Extract metadata
    v_restaurant_name := NEW.raw_user_meta_data->>'restaurant_name';
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
    
    -- Cleanup stale data for this email
    DELETE FROM public.restaurants WHERE email = NEW.email;
    DELETE FROM public.profiles WHERE email = NEW.email;

    -- Create Restaurant if metadata is present (New Registration)
    IF v_restaurant_name IS NOT NULL AND v_role = 'owner' THEN
        -- Generate unique slug
        v_base_slug := LOWER(REGEXP_REPLACE(v_restaurant_name, '[^a-zA-Z0-9]+', '-', 'g'));
        v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
        v_slug := v_base_slug;

        WHILE EXISTS (SELECT 1 FROM public.restaurants WHERE slug = v_slug) LOOP
            v_counter := v_counter + 1;
            v_slug := v_base_slug || '-' || v_counter;
        END LOOP;

        -- Insert restaurant using NEW.id as identifier
        INSERT INTO public.restaurants (
            id, name, slug, owner_name, phone, email, city, 
            restaurant_type, subscription_plan, is_active
        ) VALUES (
            NEW.id, 
            v_restaurant_name, 
            v_slug, 
            NEW.raw_user_meta_data->>'owner_name',
            NEW.raw_user_meta_data->>'phone',
            NEW.email,
            NEW.raw_user_meta_data->>'city',
            NEW.raw_user_meta_data->>'business_type',
            COALESCE(NEW.raw_user_meta_data->>'plan', 'starter_pack'),
            CASE 
                WHEN (NEW.raw_user_meta_data->>'plan') = 'starter_pack' OR NEW.raw_user_meta_data->>'plan' IS NULL THEN TRUE 
                ELSE FALSE 
            END
        )
        RETURNING id INTO v_restaurant_id;
    ELSE
        -- Fallback for users created without metadata or staff
        v_restaurant_id := (NEW.raw_user_meta_data->>'restaurant_id')::UUID;
    END IF;

    -- Create Profile
    INSERT INTO public.profiles (id, email, role, restaurant_id, full_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        v_role, 
        v_restaurant_id, 
        COALESCE(NEW.raw_user_meta_data->>'owner_name', NEW.raw_user_meta_data->>'full_name')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure triggers are clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5b. HANDLE USER DELETION
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Deleting from restaurants will cascade to menu_items, and orders
  DELETE FROM public.restaurants WHERE id = OLD.id;
  -- Deleting from profiles will handle cleanup of any other profile data
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- 6. HARDEN RLS POLICIES

-- Helper function to get current user's restaurant_id
CREATE OR REPLACE FUNCTION public.get_my_restaurant_id()
RETURNS UUID AS $$
  SELECT restaurant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- A. RESTAURANTS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Public view menu" ON public.restaurants;
DROP POLICY IF EXISTS "Allow All Restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public Read Restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Owners Update Own Restaurant" ON public.restaurants;

CREATE POLICY "Public Read Restaurants"
ON public.restaurants FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Owners Update Own Restaurant"
ON public.restaurants FOR UPDATE
TO authenticated
USING (id = public.get_my_restaurant_id())
WITH CHECK (id = public.get_my_restaurant_id());

-- B. MENU CATEGORIES
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage own categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public view categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Allow All Categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public Read Categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Owners Manage Categories" ON public.menu_categories;

CREATE POLICY "Public Read Categories"
ON public.menu_categories FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Owners Manage Categories"
ON public.menu_categories FOR ALL
TO authenticated
USING (restaurant_id = public.get_my_restaurant_id())
WITH CHECK (restaurant_id = public.get_my_restaurant_id());

-- C. MENU ITEMS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage own items" ON public.menu_items;
DROP POLICY IF EXISTS "Public view items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow All Items" ON public.menu_items;
DROP POLICY IF EXISTS "Public Read Items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners Manage Items" ON public.menu_items;

CREATE POLICY "Public Read Items"
ON public.menu_items FOR SELECT
TO public
USING (is_available = true);

CREATE POLICY "Owners Manage Items"
ON public.menu_items FOR ALL
TO authenticated
USING (restaurant_id = public.get_my_restaurant_id())
WITH CHECK (restaurant_id = public.get_my_restaurant_id());

-- D. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage own orders" ON public.orders;
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
DROP POLICY IF EXISTS "Owners View Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Create Orders" ON public.orders;
DROP POLICY IF EXISTS "Owners Manage Orders" ON public.orders;

CREATE POLICY "Public Create Orders"
ON public.orders FOR INSERT
TO public, authenticated
WITH CHECK (true);

CREATE POLICY "Owners Manage Orders"
ON public.orders FOR ALL
TO authenticated
USING (restaurant_id = public.get_my_restaurant_id())
WITH CHECK (restaurant_id = public.get_my_restaurant_id());

-- E. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 7. TENANT ISOLATION & DATA INTEGRITY
-- Trigger to prevent restaurant_id spoofing on INSERT/UPDATE for authenticated users
CREATE OR REPLACE FUNCTION public.enforce_tenant_isolation()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'authenticated' THEN
        NEW.restaurant_id := public.get_my_restaurant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply isolation trigger to relevant tables
DROP TRIGGER IF EXISTS tr_isolate_menu_items ON public.menu_items;
CREATE TRIGGER tr_isolate_menu_items 
BEFORE INSERT OR UPDATE ON public.menu_items 
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_isolation();

DROP TRIGGER IF EXISTS tr_isolate_menu_categories ON public.menu_categories;
CREATE TRIGGER tr_isolate_menu_categories 
BEFORE INSERT OR UPDATE ON public.menu_categories 
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_isolation();

-- Special case for Orders: If authenticated, enforce isolation. If public, allow provided ID.
CREATE OR REPLACE FUNCTION public.enforce_order_isolation()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'authenticated' THEN
        NEW.restaurant_id := public.get_my_restaurant_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_isolate_orders ON public.orders;
CREATE TRIGGER tr_isolate_orders 
BEFORE INSERT OR UPDATE ON public.orders 
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_isolation();

-- 8. ADMIN RPC FUNCTIONS
CREATE OR REPLACE FUNCTION public.admin_approve_request(
  p_request_id UUID,
  p_subscription_plan TEXT,
  p_internal_notes TEXT DEFAULT NULL
)
RETURNS TABLE (is_success BOOLEAN, msg TEXT, r_id UUID)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_email TEXT;
  v_restaurant_id UUID;
BEGIN
  -- 1. Get the email from the request
  SELECT email INTO v_email FROM public.registration_requests WHERE id = p_request_id;
  
  -- 2. Update the request status
  UPDATE public.registration_requests
  SET status = 'verified', 
      internal_notes = p_internal_notes,
      updated_at = NOW()
  WHERE id = p_request_id;

  -- 3. Find and activate the restaurant
  UPDATE public.restaurants
  SET is_active = TRUE,
      subscription_plan = p_subscription_plan,
      updated_at = NOW()
  WHERE email = v_email
  RETURNING id INTO v_restaurant_id;

  RETURN QUERY SELECT TRUE, 'Restaurant activated successfully'::TEXT, v_restaurant_id;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT FALSE, SQLERRM, NULL::UUID;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_request(
  p_request_id UUID,
  p_rejection_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.registration_requests
  SET status = 'rejected',
      rejection_reason = p_rejection_reason,
      updated_at = NOW()
  WHERE id = p_request_id;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toggle_restaurant_status(
  p_restaurant_id UUID,
  p_is_active BOOLEAN,
  p_block_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.restaurants
  SET is_active = p_is_active,
      updated_at = NOW()
  WHERE id = p_restaurant_id;
  
  -- Optionally log block reason if needed
  
  RETURN TRUE;
END;
$$;
