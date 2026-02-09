-- =====================================================
-- SECURITY LOCKDOWN MIGRATION
-- Phase 1: Auth Integration & RLS Enforcement
-- =====================================================

-- 1. AUTH SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_restaurant_id UUID;
BEGIN
    v_restaurant_id := (NEW.raw_user_meta_data->>'restaurant_id')::UUID;

    INSERT INTO public.users (id, email, role, restaurant_id)
    VALUES (NEW.id, NEW.email, 'owner', v_restaurant_id)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        restaurant_id = COALESCE(v_restaurant_id, public.users.restaurant_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 2. DATABASE RLS LOCKDOWN

-- A. RESTAURANTS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Public Read Restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Public Update Restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Owners manage own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Public view menu" ON public.restaurants;

CREATE POLICY "Owners manage own restaurant"
ON public.restaurants FOR ALL
TO authenticated
USING (id = (SELECT restaurant_id FROM public.users WHERE id = auth.uid()))
WITH CHECK (id = (SELECT restaurant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Public view menu"
ON public.restaurants FOR SELECT
TO public
USING (is_active = true);

-- B. MENU CATEGORIES
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Public view categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Owners manage own categories" ON public.menu_categories;

CREATE POLICY "Owners manage own categories"
ON public.menu_categories FOR ALL
TO authenticated
USING (restaurant_id = (SELECT restaurant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Public view categories"
ON public.menu_categories FOR SELECT
TO public
USING (is_active = true);

-- C. MENU ITEMS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All Items" ON public.menu_items;
DROP POLICY IF EXISTS "Public view items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners manage own items" ON public.menu_items;

CREATE POLICY "Owners manage own items"
ON public.menu_items FOR ALL
TO authenticated
USING (restaurant_id = (SELECT restaurant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Public view items"
ON public.menu_items FOR SELECT
TO public
USING (is_available = true);

-- D. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Create Orders" ON public.orders;
DROP POLICY IF EXISTS "Owners View Orders" ON public.orders;
DROP POLICY IF EXISTS "Owners manage own orders" ON public.orders;
DROP POLICY IF EXISTS "Public create orders" ON public.orders;

CREATE POLICY "Owners manage own orders"
ON public.orders FOR ALL
TO authenticated
USING (restaurant_id = (SELECT restaurant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Public create orders"
ON public.orders FOR INSERT
TO public, authenticated
WITH CHECK (true);

-- 3. STORAGE LOCKDOWN
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow Public View" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Owners upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Public view assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners manage own assets" ON storage.objects;
DROP POLICY IF EXISTS "Public View Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Assets" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Assets" ON storage.objects;

CREATE POLICY "Public view assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-assets');

CREATE POLICY "Owners manage own assets"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'restaurant-assets' AND
  (storage.foldername(name))[1] = (SELECT restaurant_id::text FROM public.users WHERE id = auth.uid())
)
WITH CHECK (
  bucket_id = 'restaurant-assets' AND
  (storage.foldername(name))[1] = (SELECT restaurant_id::text FROM public.users WHERE id = auth.uid())
);