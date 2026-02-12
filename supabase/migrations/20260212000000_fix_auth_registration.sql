-- =====================================================
-- FIX AUTH REGISTRATION & RESTAURANT CREATION
-- =====================================================

-- 1. Remove password_hash requirement from public.users as we use Supabase Auth
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
-- In case it's still there from setup.sql, let's make it optional
ALTER TABLE public.users ALTER COLUMN password_hash SET DEFAULT NULL;

-- 2. Update the Auth Sync Trigger to handle Restaurant Creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_restaurant_id UUID;
    v_restaurant_name TEXT;
    v_slug TEXT;
    v_base_slug TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- Extract metadata from auth.signUp options.data
    v_restaurant_name := NEW.raw_user_meta_data->>'restaurant_name';
    
    -- Check if it's a new registration (metadata present)
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

        -- Create the restaurant first
        INSERT INTO public.restaurants (
            id,
            name, 
            slug, 
            owner_name, 
            phone, 
            email, 
            city, 
            restaurant_type, 
            subscription_plan,
            is_active
        ) VALUES (
            NEW.id, -- Link restaurant ID to User ID for easy lookup
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
        -- Fallback for users created without metadata or with explicit restaurant_id
        v_restaurant_id := (NEW.raw_user_meta_data->>'restaurant_id')::UUID;
    END IF;

    -- Create/Update the user record in public.users
    INSERT INTO public.users (id, email, role, restaurant_id)
    VALUES (NEW.id, NEW.email, 'owner', v_restaurant_id)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        restaurant_id = COALESCE(v_restaurant_id, public.users.restaurant_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable the trigger just in case
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
