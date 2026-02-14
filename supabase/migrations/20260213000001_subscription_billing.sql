-- =====================================================
-- FINTECH INFRASTRUCTURE: SUBSCRIPTION BILLING
-- Migration: 20260213000001_subscription_billing.sql
-- =====================================================

-- 1. SUBSCRIPTION STATUS ENUM
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- e.g., 'starter_pack', 'growth_pack'
    name TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    billing_interval TEXT DEFAULT 'month', -- 'month', 'year'
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    status subscription_status NOT NULL DEFAULT 'active',
    
    -- Gateway Details
    gateway_name TEXT DEFAULT 'razorpay', -- 'razorpay', 'stripe'
    gateway_subscription_id TEXT UNIQUE,
    gateway_customer_id TEXT,
    
    -- Billing Periods
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(restaurant_id)
);

-- 4. INSERT DEFAULT PLANS (Sync with APP_CONFIG)
INSERT INTO public.plans (id, name, description, price_amount, features)
VALUES 
('starter_pack', 'Starter Pack', 'Basic QR Menu for new restaurants', 0.00, '["Up to 20 Menu Items", "Basic QR Menu", "Dine-in Orders Only"]'),
('growth_pack', 'Growth Pack', 'Everything you need to grow', 999.00, '["Unlimited Menu Items", "Dine-in & Takeaway", "Basic Analytics"]'),
('customizeble_pack', 'Customizable Pack', 'Advanced features for scaling', 2499.00, '["Everything in Growth", "Advanced Analytics", "UPI Integration"]')
ON CONFLICT (id) DO UPDATE SET 
    price_amount = EXCLUDED.price_amount,
    features = EXCLUDED.features;

-- 5. RLS POLICIES
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Plans" ON public.plans FOR SELECT TO public USING (is_active = true);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners View Own Subscription" ON public.subscriptions FOR SELECT TO authenticated USING (restaurant_id = public.get_my_restaurant_id());

-- 6. AUTOMATION: SYNC RESTAURANT STATUS
CREATE OR REPLACE FUNCTION public.sync_restaurant_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the restaurant's subscription_plan and active status based on subscription
    UPDATE public.restaurants
    SET 
        subscription_plan = NEW.plan_id,
        is_active = CASE 
            WHEN NEW.status IN ('active', 'trialing') THEN TRUE 
            ELSE FALSE 
        END
    WHERE id = NEW.restaurant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_sync_subscription_to_restaurant
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_restaurant_subscription();

-- 7. HELPER: CHECK PREMIUM ACCESS
CREATE OR REPLACE FUNCTION public.has_premium_access(p_restaurant_id UUID, p_feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan_id TEXT;
    v_status subscription_status;
BEGIN
    SELECT plan_id, status INTO v_plan_id, v_status
    FROM public.subscriptions
    WHERE restaurant_id = p_restaurant_id;

    IF v_status NOT IN ('active', 'trialing') THEN
        RETURN FALSE;
    END IF;

    -- Feature logic
    IF p_feature = 'analytics' THEN
        RETURN v_plan_id IN ('growth_pack', 'customizeble_pack');
    ELSIF p_feature = 'upi' THEN
        RETURN v_plan_id = 'customizeble_pack';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
