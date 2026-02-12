-- =====================================================
-- RESILIENCE & CLEANUP MIGRATION
-- Handles re-registration and stale data cleanup
-- =====================================================

-- 1. Create a function to clean up public data when an Auth user is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Deleting from restaurants will cascade to users, menu_items, and orders
  -- as they all have FKs with ON DELETE CASCADE
  DELETE FROM public.restaurants WHERE id = OLD.id;
  
  -- Also delete from public.users just in case the ID was different
  DELETE FROM public.users WHERE id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the deletion trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- 3. Update the Registration Trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_restaurant_id UUID;
    v_restaurant_name TEXT;
    v_slug TEXT;
    v_base_slug TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- A. Extract metadata
    v_restaurant_name := NEW.raw_user_meta_data->>'restaurant_name';
    
    -- B. STALE DATA CLEANUP
    -- If a restaurant or public user already exists with this email, 
    -- it means there is leftover data from a deleted auth account.
    -- We must remove it to avoid UNIQUE constraint violations.
    DELETE FROM public.restaurants WHERE email = NEW.email;
    DELETE FROM public.users WHERE email = NEW.email;

    -- C. Create Restaurant if metadata is present (New Registration)
    IF v_restaurant_name IS NOT NULL THEN
        -- Generate initial slug
        v_base_slug := LOWER(REGEXP_REPLACE(v_restaurant_name, '[^a-zA-Z0-9]+', '-', 'g'));
        v_base_slug := TRIM(BOTH '-' FROM v_base_slug);
        v_slug := v_base_slug;

        -- Ensure unique slug
        WHILE EXISTS (SELECT 1 FROM public.restaurants WHERE slug = v_slug) LOOP
            v_counter := v_counter + 1;
            v_slug := v_base_slug || '-' || v_counter;
        END LOOP;

        -- Insert restaurant using NEW.id (the newly created Auth User ID)
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
        -- Fallback for users created without metadata
        BEGIN
            v_restaurant_id := (NEW.raw_user_meta_data->>'restaurant_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_restaurant_id := NULL;
        END;
    END IF;

    -- D. Create/Update the user record in public.users
    INSERT INTO public.users (id, email, role, restaurant_id)
    VALUES (NEW.id, NEW.email, 'owner', v_restaurant_id)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        restaurant_id = COALESCE(v_restaurant_id, public.users.restaurant_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
