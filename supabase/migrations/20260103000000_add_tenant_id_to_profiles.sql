-- Add tenant_id column to profiles table for multi-tenant support
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- Update RLS policies to allow admins to view profiles with tenant_id
-- (existing policies already cover this, but we ensure tenant_id is accessible)

-- Add comment
COMMENT ON COLUMN public.profiles.tenant_id IS 'Restaurant ID for admin_restaurante users. Links the user to their restaurant tenant.';

