# Email Deliverability Testing Guide

This guide provides comprehensive instructions for testing email deliverability across major Brazilian email providers.

## Overview

The Educa Sol email automation system has been fully implemented with:
- ✅ 9 email templates (welcome, onboarding, usage alerts, re-engagement, etc.)
- ✅ 7 Edge Functions for automation and processing
- ✅ 3 database migrations with proper indexes and triggers
- ✅ LGPD-compliant consent management
- ✅ Unsubscribe functionality with token-based authentication
- ✅ Automated jobs for re-engagement and weekly summaries

## Pre-Testing Checklist

### 1. Resend Configuration
- [ ] Domain authenticated in Resend dashboard
- [ ] DNS records configured (DKIM, SPF, DMARC)
- [ ] API key configured in Supabase secrets
- [ ] From address verified: `noreply@educasol.com.br`

### 2. Database Setup
- [ ] All migrations applied successfully
- [ ] `marketing_preferences` table exists with proper triggers
- [ ] `email_logs` table exists for tracking
- [ ] `automation_queue` table exists for scheduled emails

### 3. Edge Functions Deployed
- [ ] `send-email` function deployed and accessible
- [ ] `trigger-automation` function deployed
- [ ] `unsubscribe` function deployed
- [ ] Automation jobs deployed (reengagement, weekly-summary)

## Deliverability Testing Plan

### Phase 1: Template Rendering Tests

Test each email template renders correctly:

```bash
# Test welcome email
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@yourdomain.com",
    "templateId": "welcome",
    "userId": "test-user-id",
    "data": {
      "userName": "Professor Teste"
    }
  }'
```

**Templates to test:**
- [ ] `welcome` - Welcome email
- [ ] `onboarding-day1` - BNCC help email
- [ ] `onboarding-day3` - Advanced features
- [ ] `usage-warning-80` - 80% usage alert
- [ ] `usage-warning-100` - 100% usage alert
- [ ] `usage-followup` - Post-limit followup
- [ ] `activity-summary` - Weekly summary
- [ ] `reengagement` - Re-engagement email
- [ ] `churn-survey` - Cancellation survey

### Phase 2: Brazilian Email Provider Testing

Test deliverability across major Brazilian email providers:

#### Gmail (@gmail.com)
- [ ] Email arrives in inbox (not spam)
- [ ] Images load correctly
- [ ] Links work properly
- [ ] Unsubscribe link functions
- [ ] Mobile rendering is acceptable

#### Outlook/Hotmail (@outlook.com, @hotmail.com)
- [ ] Email arrives in inbox
- [ ] Formatting preserved
- [ ] Images display (may require user action)
- [ ] Links functional
- [ ] Unsubscribe works

#### UOL (@uol.com.br)
- [ ] Delivery successful
- [ ] No spam folder placement
- [ ] Brazilian Portuguese content displays correctly
- [ ] All functionality works

#### Bol (@bol.com.br)
- [ ] Inbox delivery
- [ ] Content formatting maintained
- [ ] Interactive elements work
- [ ] Unsubscribe functional

#### Terra (@terra.com.br)
- [ ] Successful delivery
- [ ] Proper rendering
- [ ] Link functionality
- [ ] Compliance features work

### Phase 3: Automation Flow Testing

#### Welcome Series Test
1. Create test user with LGPD consent
2. Verify welcome email sent immediately
3. Check onboarding-day1 scheduled for 24h later
4. Check onboarding-day3 scheduled for 72h later
5. Verify emails respect user consent settings

#### Usage Alert Test
1. Simulate user reaching 80% usage
2. Verify usage-warning-80 email sent
3. Check cooldown prevents duplicate emails
4. Test 100% usage alert
5. Verify followup email after 24h

#### Re-engagement Test
1. Set user last_sign_in_at to 15 days ago
2. Run reengagement job manually
3. Verify email sent to inactive user
4. Check cooldown prevents spam
5. Verify consent is respected

#### Weekly Summary Test
1. Create user activity for past week
2. Run weekly-summary job manually
3. Verify email contains correct metrics
4. Check users without activity don't receive email
5. Verify product_updates consent is respected

### Phase 4: LGPD Compliance Testing

#### Consent Management
- [ ] New users have all preferences set to `false` by default
- [ ] Auth page checkbox works correctly
- [ ] Checking consent updates marketing_preferences
- [ ] Marketing emails respect consent settings
- [ ] Transactional emails sent regardless of marketing consent

#### Unsubscribe Testing
- [ ] Unsubscribe links in emails work
- [ ] Token validation prevents unauthorized access
- [ ] One-click unsubscribe functions
- [ ] Preferences page allows granular control
- [ ] Changes are saved correctly
- [ ] Unsubscribed users don't receive marketing emails

### Phase 5: Performance and Reliability Testing

#### Load Testing
- [ ] Send 100 emails simultaneously
- [ ] Verify all emails processed
- [ ] Check error handling for failures
- [ ] Verify retry logic works
- [ ] Monitor Resend API rate limits

#### Error Handling
- [ ] Invalid email addresses handled gracefully
- [ ] Network failures trigger retries
- [ ] Malformed templates fail safely
- [ ] Database errors logged properly
- [ ] User feedback for failures

## Testing Tools and Scripts

### Manual Testing Script

```bash
#!/bin/bash
# Email deliverability test script

SUPABASE_URL="https://your-project.supabase.co"
SERVICE_ROLE_KEY="your-service-role-key"
TEST_EMAIL="your-test@email.com"

echo "Testing email deliverability..."

# Test each template
templates=("welcome" "onboarding-day1" "usage-warning-80" "reengagement")

for template in "${templates[@]}"; do
  echo "Testing $template template..."
  
  response=$(curl -s -X POST "$SUPABASE_URL/functions/v1/send-email" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"to\": \"$TEST_EMAIL\",
      \"templateId\": \"$template\",
      \"userId\": \"test-user-$(date +%s)\",
      \"data\": {
        \"userName\": \"Professor Teste\",
        \"usagePercent\": 85,
        \"currentUsage\": 17,
        \"limit\": 20
      }
    }")
  
  if echo "$response" | grep -q '"success":true'; then
    echo "✓ $template sent successfully"
  else
    echo "✗ $template failed: $response"
  fi
  
  sleep 2  # Rate limiting
done

echo "Testing complete. Check your inbox at $TEST_EMAIL"
```

### Automation Testing

```sql
-- Test automation triggers
-- Run these in Supabase SQL editor

-- 1. Test welcome series
INSERT INTO auth.users (id, email, created_at) 
VALUES ('test-user-123', 'test@example.com', NOW());

-- 2. Test usage alert
INSERT INTO usage_logs (user_id, generation_type, created_at) 
VALUES ('existing-user-id', 'lesson_plan', NOW());

-- 3. Test re-engagement (simulate inactive user)
UPDATE profiles 
SET last_sign_in_at = NOW() - INTERVAL '15 days'
WHERE id = 'existing-user-id';

-- Then run the automation jobs manually
```

## Monitoring and Metrics

### Key Metrics to Track

1. **Delivery Rate**: % of emails successfully sent
   - Target: > 98% for transactional, > 95% for marketing

2. **Open Rate**: % of delivered emails opened
   - Target: > 60% for transactional, > 25% for marketing

3. **Click Rate**: % of opened emails with clicks
   - Target: > 3% for marketing emails

4. **Unsubscribe Rate**: % of recipients who unsubscribe
   - Target: < 2% per campaign

5. **Spam Rate**: % of emails marked as spam
   - Target: < 0.1%

### Monitoring Queries

```sql
-- Email delivery stats (last 7 days)
SELECT 
  template_id,
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY template_id), 2) as percentage
FROM email_logs 
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY template_id, status
ORDER BY template_id, status;

-- Automation job performance
SELECT 
  template_id,
  COUNT(*) as total_scheduled,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_processing_time_seconds
FROM automation_queue 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY template_id;

-- LGPD compliance check
SELECT 
  lgpd_consent,
  newsletter,
  product_updates,
  COUNT(*) as user_count
FROM marketing_preferences 
GROUP BY lgpd_consent, newsletter, product_updates;
```

## Troubleshooting Common Issues

### Email Not Delivered
1. Check Resend dashboard for delivery status
2. Verify DNS records are properly configured
3. Check if recipient email is valid
4. Review email content for spam triggers
5. Verify sender reputation

### Template Rendering Issues
1. Check React Email component syntax
2. Verify all required props are provided
3. Test template in isolation
4. Check for missing imports or dependencies

### Automation Not Triggering
1. Verify database webhooks are configured
2. Check Edge Function logs for errors
3. Verify user meets trigger conditions
4. Check marketing preferences and cooldowns
5. Verify cron jobs are running

### LGPD Compliance Issues
1. Verify marketing_preferences table structure
2. Check trigger function for new users
3. Verify unsubscribe token generation
4. Test preferences page functionality
5. Audit email sending logic for consent checks

## Success Criteria

The email automation system is considered ready for production when:

- [ ] All 9 email templates render correctly across major email clients
- [ ] Delivery rate > 98% for transactional emails
- [ ] Delivery rate > 95% for marketing emails
- [ ] All automation flows work end-to-end
- [ ] LGPD compliance verified (consent, unsubscribe, preferences)
- [ ] Performance meets requirements (< 5s email processing)
- [ ] Error handling and monitoring in place
- [ ] Documentation complete and accessible

## Post-Launch Monitoring

After going live, monitor these metrics weekly:

1. **Email Performance Dashboard** in Resend
2. **Database Metrics** via Supabase dashboard
3. **User Feedback** on email quality and frequency
4. **Compliance Audits** for LGPD adherence
5. **System Performance** and error rates

Regular reviews should be conducted monthly to optimize:
- Email content and design
- Send timing and frequency
- Automation trigger conditions
- User segmentation and targeting