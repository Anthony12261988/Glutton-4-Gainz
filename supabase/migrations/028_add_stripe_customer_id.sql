-- Add Stripe customer ID to profiles for subscription management
-- Migration: 028_add_stripe_customer_id
-- Created: 2025-12-04

-- Add stripe_customer_id column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON profiles(stripe_customer_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for subscription management';
