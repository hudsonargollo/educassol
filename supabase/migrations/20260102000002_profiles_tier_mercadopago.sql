-- Migration: Extend Profiles Table for Tier and MercadoPago
-- Adds tier, MercadoPago customer/subscription IDs, and subscription status
-- Requirements: 10.6

-- Create subscription_status enum for MercadoPago subscription states
CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'pending',
  'paused',
  'cancelled'
);

-- Add tier column with default 'free'
-- Using the user_tier enum created in the previous migration
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS tier public.user_tier NOT NULL DEFAULT 'free';

-- Add MercadoPago customer ID column
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS mp_customer_id TEXT;

-- Add MercadoPago subscription ID column
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

-- Add subscription status column (nullable - null means no subscription)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS subscription_status public.subscription_status;

-- Index for tier-based queries (e.g., finding all premium users)
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles (tier);

-- Index for MercadoPago subscription lookups (webhook handling)
CREATE INDEX IF NOT EXISTS idx_profiles_mp_subscription ON public.profiles (mp_subscription_id) 
  WHERE mp_subscription_id IS NOT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN public.profiles.tier IS 'User subscription tier: free, premium, or enterprise';
COMMENT ON COLUMN public.profiles.mp_customer_id IS 'MercadoPago customer ID for payment processing';
COMMENT ON COLUMN public.profiles.mp_subscription_id IS 'MercadoPago subscription/preapproval ID';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current MercadoPago subscription status';
