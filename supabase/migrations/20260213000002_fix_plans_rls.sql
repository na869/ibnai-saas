-- =====================================================
-- FIX PLANS AND RLS
-- Migration: 20260213000002_fix_plans_rls.sql
-- =====================================================

-- 1. INSERT DEFAULT PLANS IF MISSING
INSERT INTO public.plans (id, name, description, price_amount, features)
VALUES 
('starter_pack', 'Starter Pack', 'Basic QR Menu for new restaurants', 0.00, '["Up to 20 Menu Items", "Basic QR Menu", "Dine-in Orders Only"]'),
('growth_pack', 'Growth Pack', 'Everything you need to grow', 999.00, '["Unlimited Menu Items", "Dine-in & Takeaway", "Basic Analytics"]'),
('customizeble_pack', 'Customizable Pack', 'Advanced features for scaling', 2499.00, '["Everything in Growth", "Advanced Analytics", "UPI Integration"]')
ON CONFLICT (id) DO UPDATE SET 
    price_amount = EXCLUDED.price_amount,
    features = EXCLUDED.features;

-- 2. FIX RLS FOR PLANS TABLE
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (idempotent)
DROP POLICY IF EXISTS "Public Read Plans" ON public.plans;

-- Create policy to allow public read access
CREATE POLICY "Public Read Plans" 
ON public.plans 
FOR SELECT 
TO public 
USING (is_active = true);

-- 3. ENSURE NEW USERS GET DEFAULT TRIAL/ACTIVE STATUS
-- This logic is typically handled in the handle_new_auth_user trigger, but let's double check.
-- The existing trigger sets subscription_plan based on metadata.

