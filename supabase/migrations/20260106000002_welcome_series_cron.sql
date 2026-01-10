-- Migration: Welcome Series Cron Job
-- Requirements: 6.1, 6.2, 6.3
-- 
-- This migration sets up a cron job to process scheduled emails from the automation_queue.
-- The cron job runs every 5 minutes to check for pending emails that are due.
--
-- Note: This requires the pg_cron extension to be enabled in Supabase.
-- If pg_cron is not available, you can use an external scheduler (e.g., GitHub Actions, 
-- AWS EventBridge, or a simple cron job) to call the process-email-queue Edge Function.

-- Enable pg_cron extension if not already enabled
-- Note: This may require superuser privileges and might already be enabled in Supabase
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the process-email-queue Edge Function
-- This function will be called by the cron job
CREATE OR REPLACE FUNCTION public.process_scheduled_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT;
  service_role_key TEXT;
  response JSONB;
BEGIN
  -- Get the Supabase URL and service role key from vault or environment
  -- Note: In production, these should be stored securely in Supabase Vault
  -- For now, we'll use a direct HTTP call approach
  
  -- This function is a placeholder. The actual processing is done by the Edge Function.
  -- The cron job should call the Edge Function directly via HTTP.
  
  RAISE NOTICE 'process_scheduled_emails called at %', NOW();
END;
$$;

-- Add index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_automation_queue_pending_scheduled 
  ON public.automation_queue(scheduled_for, status) 
  WHERE status = 'pending';

-- Add index for user content check (used by hasUserCreatedContent)
CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_created 
  ON public.lesson_plans(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_unit_plans_user_created 
  ON public.unit_plans(user_id, created_at);

-- Comment explaining how to set up the cron job
COMMENT ON FUNCTION public.process_scheduled_emails() IS 
'Placeholder function for processing scheduled emails. 
To enable automatic processing, set up one of the following:

1. Supabase pg_cron (if available):
   SELECT cron.schedule(
     ''process-email-queue'',
     ''*/5 * * * *'',  -- Every 5 minutes
     $$SELECT net.http_post(
       url := ''https://your-project.supabase.co/functions/v1/process-email-queue'',
       headers := jsonb_build_object(''Authorization'', ''Bearer '' || current_setting(''app.service_role_key'')),
       body := ''{}''::jsonb
     )$$
   );

2. External cron service (GitHub Actions, AWS EventBridge, etc.):
   Call POST https://your-project.supabase.co/functions/v1/process-email-queue
   with Authorization: Bearer <service_role_key>
   every 5 minutes.

3. Supabase Database Webhooks:
   Not recommended for scheduled tasks, but can be used for event-driven processing.
';
