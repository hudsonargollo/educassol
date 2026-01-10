# Email Automation Jobs

This document describes the automated email jobs that handle re-engagement, weekly summaries, and churn prevention.

## Overview

The email automation system consists of several Edge Functions that work together:

1. **reengagement-job** - Finds inactive users and sends re-engagement emails
2. **weekly-summary-job** - Calculates weekly metrics and sends activity summaries  
3. **churn-prevention-webhook** - Handles subscription cancellations and sends churn surveys
4. **process-email-queue** - Processes scheduled emails (onboarding series)

## Job Details

### 1. Re-engagement Job

**Function:** `reengagement-job`  
**Schedule:** Daily at 9 AM UTC  
**Requirements:** 7.1, 7.3

**Purpose:**
- Finds users who haven't logged in for 14+ days
- Respects LGPD consent (only users with `lgpd_consent=true` and `newsletter=true`)
- Triggers re-engagement emails with educational content
- Has built-in cooldown (14 days) to prevent spam

**Manual Testing:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/reengagement-job \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2. Weekly Summary Job

**Function:** `weekly-summary-job`  
**Schedule:** Weekly on Sunday at 8 PM UTC  
**Requirements:** 9.1, 9.3, 9.4

**Purpose:**
- Calculates weekly activity metrics (lesson plans, activities, assessments)
- Only sends to users with `product_updates=true` consent
- Only sends to users who had activity in the past week
- Includes personalized metrics and encouragement

**Manual Testing:**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/weekly-summary-job \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. Churn Prevention Webhook

**Function:** `churn-prevention-webhook`  
**Trigger:** Webhook from payment provider  
**Requirements:** 8.1

**Purpose:**
- Receives subscription cancellation webhooks
- Triggers churn survey emails immediately
- Includes satisfaction survey and reactivation offer

**Webhook Integration:**
Configure your payment provider (Mercado Pago, Stripe, etc.) to call:
```
POST https://your-project.supabase.co/functions/v1/churn-prevention-webhook
```

**Payload Format:**
```json
{
  "userId": "uuid",
  "subscriptionId": "string",
  "reason": "string",
  "previousTier": "premium",
  "cancelledAt": "2024-01-01T00:00:00Z"
}
```

## Setup Instructions

### Option 1: Supabase pg_cron (Recommended)

If your Supabase project has pg_cron enabled:

```sql
-- Re-engagement job (daily at 9 AM UTC)
SELECT cron.schedule(
  'reengagement-job',
  '0 9 * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/reengagement-job',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := '{}'::jsonb
  )$$
);

-- Weekly summary job (Sunday at 8 PM UTC)
SELECT cron.schedule(
  'weekly-summary-job',
  '0 20 * * 0',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/weekly-summary-job',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := '{}'::jsonb
  )$$
);
```

### Option 2: GitHub Actions

Create `.github/workflows/email-automation.yml`:

```yaml
name: Email Automation Jobs

on:
  schedule:
    # Re-engagement job - daily at 9 AM UTC
    - cron: '0 9 * * *'
    # Weekly summary job - Sunday at 8 PM UTC  
    - cron: '0 20 * * 0'

jobs:
  reengagement:
    if: github.event.schedule == '0 9 * * *'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Re-engagement Job
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/reengagement-job \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'

  weekly-summary:
    if: github.event.schedule == '0 20 * * 0'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Weekly Summary Job
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/weekly-summary-job \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

### Option 3: AWS EventBridge

Create EventBridge rules that trigger Lambda functions or direct HTTP calls to the Edge Functions.

## Monitoring

### Check Job Status

Query the automation job status view:

```sql
SELECT * FROM public.automation_job_status;
```

### Monitor Email Logs

Check recent automation emails:

```sql
SELECT 
  template_id,
  status,
  COUNT(*) as count,
  MAX(sent_at) as last_sent
FROM email_logs 
WHERE template_id IN ('reengagement', 'activity-summary', 'churn-survey')
  AND sent_at >= NOW() - INTERVAL '7 days'
GROUP BY template_id, status
ORDER BY template_id, status;
```

### Check Cooldown Status

See which users are in cooldown for specific templates:

```sql
SELECT 
  user_id,
  template_id,
  sent_at,
  NOW() - sent_at as time_since_last
FROM email_logs 
WHERE template_id IN ('reengagement', 'activity-summary')
  AND status = 'sent'
  AND sent_at >= NOW() - INTERVAL '14 days'
ORDER BY sent_at DESC;
```

## Troubleshooting

### Common Issues

1. **No emails being sent**
   - Check marketing preferences: users must have appropriate consent
   - Verify cooldown periods haven't been triggered
   - Check Edge Function logs in Supabase dashboard

2. **Re-engagement job not finding users**
   - Verify `last_sign_in_at` is being updated in profiles table
   - Check that users have `lgpd_consent=true` and `newsletter=true`

3. **Weekly summary showing no activity**
   - Verify table names match your schema (lesson_plans, generated_activities, etc.)
   - Check that `created_at` timestamps are within the week range

4. **Webhook not triggering churn emails**
   - Verify webhook URL is correct in payment provider
   - Check webhook payload format matches expected schema
   - Verify user exists in profiles table

### Debug Mode

Add debug logging by setting environment variables:

```bash
# In Supabase Edge Function settings
DEBUG_AUTOMATION=true
```

This will add more detailed console logs for troubleshooting.

## Performance Considerations

- Jobs process users in batches (100-500 at a time) to avoid timeouts
- Database indexes are optimized for automation queries
- Cooldown periods prevent spam and reduce load
- Failed emails are logged but don't stop batch processing

## Security

- All jobs use service role key for database access
- Webhook endpoints validate payload structure
- User consent is checked before sending any marketing emails
- Personal data is handled according to LGPD requirements