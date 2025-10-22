-- Add super_admin role to the app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';