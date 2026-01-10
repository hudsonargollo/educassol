-- Migration: Automation Cron Jobs (Simplified)
-- Requirements: 7.1, 7.3, 9.1, 9.3, 9.4
-- 
-- This migration sets up placeholder functions for automated email campaigns.
-- The actual scheduling will be handled externally due to pg_cron limitations.

-- Create placeholder functions for cron jobs
-- These functions will be called by external schedulers

CREATE OR REPLACE FUNCTION public.run_reengagement_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is a placeholder. The actual processing is done by the Edge Function.
  -- The cron job should call the Edge Function directly via HTTP.
  RAISE NOTICE 'run_reengagement_job called at %', NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.run_weekly_summary_job()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is a placeholder. The actual processing is done by the Edge Function.
  -- The cron job should call the Edge Function directly via HTTP.
  RAISE NOTICE 'run_weekly_summary_job called at %', NOW();
END;
$$;

-- Comment explaining how to set up the cron jobs
COMMENT ON FUNCTION public.run_reengagement_job() IS 
'Placeholder function for re-engagement automation. 
To enable automatic processing, set up external cron service to call:
POST https://your-project.supabase.co/functions/v1/reengagement-job
with Authorization: Bearer <service_role_key>
daily at 9 AM UTC.';

COMMENT ON FUNCTION public.run_weekly_summary_job() IS 
'Placeholder function for weekly summary automation. 
To enable automatic processing, set up external cron service to call:
POST https://your-project.supabase.co/functions/v1/weekly-summary-job
with Authorization: Bearer <service_role_key>
weekly on Sunday at 8 PM UTC.';

-- Create a view for monitoring automation job status
CREATE OR REPLACE VIEW public.automation_job_status AS
SELECT 
  'reengagement' as job_name,
  'Daily at 9 AM UTC' as schedule,
  'Finds users inactive 14+ days and sends re-engagement emails' as description,
  'https://your-project.supabase.co/functions/v1/reengagement-job' as endpoint
UNION ALL
SELECT 
  'weekly-summary' as job_name,
  'Sunday at 8 PM UTC' as schedule,
  'Sends weekly activity summaries to active users' as description,
  'https://your-project.supabase.co/functions/v1/weekly-summary-job' as endpoint
UNION ALL
SELECT 
  'process-email-queue' as job_name,
  'Every 5 minutes' as schedule,
  'Processes scheduled emails from automation_queue' as description,
  'https://your-project.supabase.co/functions/v1/process-email-queue' as endpoint;

COMMENT ON VIEW public.automation_job_status IS 
'View showing all automation jobs and their schedules. 
Use this for monitoring and documentation purposes.';

-- Grant necessary permissions
GRANT SELECT ON public.automation_job_status TO authenticated;
GRANT SELECT ON public.automation_job_status TO anon;