-- Migration: Marketing Preferences Auto-Creation Trigger
-- Requirements: 2.1 - Create marketing_preferences with defaults when user is created

-- ============================================
-- Function: create_marketing_preferences_for_new_user
-- Creates a marketing_preferences record with default values (all false)
-- when a new user is created in auth.users
-- ============================================
CREATE OR REPLACE FUNCTION public.create_marketing_preferences_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.marketing_preferences (user_id, lgpd_consent, newsletter, product_updates)
  VALUES (NEW.id, FALSE, FALSE, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: on_auth_user_created
-- Fires after a new user is inserted into auth.users
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created_marketing_prefs ON auth.users;

CREATE TRIGGER on_auth_user_created_marketing_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_marketing_preferences_for_new_user();

-- ============================================
-- Backfill: Create marketing_preferences for existing users
-- ============================================
INSERT INTO public.marketing_preferences (user_id, lgpd_consent, newsletter, product_updates)
SELECT id, FALSE, FALSE, FALSE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.marketing_preferences WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;
