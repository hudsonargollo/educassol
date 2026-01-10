/**
 * Edge Function: trigger-automation
 * 
 * Handles automation triggers from database webhooks and external events.
 * Routes events to appropriate handlers and calls send-email when conditions are met.
 * 
 * Requirements: 5.1, 5.2, 5.4, 6.1, 6.2, 6.3, 11.4, 11.5
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// Type Definitions
// ============================================

const AutomationEventEnum = z.enum([
  'user.created',
  'usage.threshold_80',
  'usage.threshold_100',
  'usage.updated',
  'payment.confirmed',
  'payment.failed',
  'subscription.cancelled',
  'user.inactive_14d',
  'weekly.summary',
  'process.scheduled_emails', // New event for processing scheduled emails
]);

type AutomationEvent = z.infer<typeof AutomationEventEnum>;

const EmailTemplateEnum = z.enum([
  'welcome',
  'usage-warning-80',
  'usage-warning-100',
  'usage-followup',
  'reset-password',
  'premium-welcome',
  'payment-failed',
  'activity-summary',
  'reengagement',
  'churn-survey',
  'onboarding-day1',
  'onboarding-day3',
]);

type EmailTemplate = z.infer<typeof EmailTemplateEnum>;

// ============================================
// Payload Schemas (Requirement 11.4)
// ============================================

// Base trigger payload
const BaseTriggerPayloadSchema = z.object({
  event: AutomationEventEnum,
  userId: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
});

// User created event payload
const UserCreatedPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.literal('user.created'),
  payload: z.object({
    email: z.string().email(),
    name: z.string().optional(),
  }),
});

// Usage updated event payload (from database webhook)
const UsageUpdatedPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.literal('usage.updated'),
  payload: z.object({
    generationType: z.string(),
    currentUsage: z.number().int().min(0),
    limit: z.number().int().min(1),
    tier: z.enum(['free', 'premium', 'enterprise']),
  }),
});

// Usage threshold events
const UsageThresholdPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.enum(['usage.threshold_80', 'usage.threshold_100']),
  payload: z.object({
    usagePercent: z.number().min(0).max(100),
    currentUsage: z.number().int().min(0),
    limit: z.number().int().min(1),
    tier: z.enum(['free', 'premium', 'enterprise']),
  }),
});

// Payment events
const PaymentPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.enum(['payment.confirmed', 'payment.failed']),
  payload: z.object({
    paymentId: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
  }),
});

// Subscription cancelled event
const SubscriptionCancelledPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.literal('subscription.cancelled'),
  payload: z.object({
    reason: z.string().optional(),
    previousTier: z.enum(['free', 'premium', 'enterprise']).optional(),
  }),
});

// Inactive user event
const InactiveUserPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.literal('user.inactive_14d'),
  payload: z.object({
    lastActiveAt: z.string().datetime().optional(),
    daysSinceActive: z.number().int().min(0).optional(),
  }),
});

// Weekly summary event
const WeeklySummaryPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.literal('weekly.summary'),
  payload: z.object({
    weekStartDate: z.string(),
    weekEndDate: z.string(),
    plansCreated: z.number().int().min(0).optional(),
    activitiesGenerated: z.number().int().min(0).optional(),
    assessmentsCreated: z.number().int().min(0).optional(),
  }),
});

// Process scheduled emails event
const ProcessScheduledEmailsPayloadSchema = BaseTriggerPayloadSchema.extend({
  event: z.literal('process.scheduled_emails'),
  payload: z.object({}).optional(),
}).transform((data) => ({
  ...data,
  payload: data.payload || {},
}));

// Union of all payload types
const AutomationTriggerSchema = z.discriminatedUnion('event', [
  UserCreatedPayloadSchema,
  UsageUpdatedPayloadSchema,
  UsageThresholdPayloadSchema,
  PaymentPayloadSchema,
  SubscriptionCancelledPayloadSchema,
  InactiveUserPayloadSchema,
  WeeklySummaryPayloadSchema,
  ProcessScheduledEmailsPayloadSchema,
]);

type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>;

// ============================================
// Cooldown Configuration (Requirement 5.4)
// ============================================

interface CooldownConfig {
  templateId: EmailTemplate;
  cooldownDays: number;
}

const COOLDOWN_CONFIG: Record<string, CooldownConfig> = {
  'usage-warning-80': { templateId: 'usage-warning-80', cooldownDays: 7 },
  'usage-warning-100': { templateId: 'usage-warning-100', cooldownDays: 7 },
  'usage-followup': { templateId: 'usage-followup', cooldownDays: 7 },
  'reengagement': { templateId: 'reengagement', cooldownDays: 14 },
  'activity-summary': { templateId: 'activity-summary', cooldownDays: 7 },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Checks if an email was sent recently (within cooldown period)
 * Requirement 5.4: Verify last_email_date to avoid spam
 */
async function checkCooldown(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  templateId: string,
  cooldownDays: number
): Promise<{ allowed: boolean; lastSentAt?: string }> {
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - cooldownDays);

  const { data, error } = await supabase
    .from('email_logs')
    .select('sent_at')
    .eq('user_id', userId)
    .eq('template_id', templateId)
    .eq('status', 'sent')
    .gte('sent_at', cooldownDate.toISOString())
    .order('sent_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking cooldown:', error);
    // Fail-safe: allow sending if we can't check
    return { allowed: true };
  }

  if (data && data.length > 0) {
    return { allowed: false, lastSentAt: data[0].sent_at };
  }

  return { allowed: true };
}

/**
 * Gets user email from profiles or auth.users
 */
async function getUserEmail(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  // Try profiles first
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (profile?.email) {
    return profile.email;
  }

  // Fallback to auth.users (requires service role)
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  
  return authUser?.user?.email || null;
}

/**
 * Gets user name from profiles
 */
async function getUserName(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();

  return profile?.full_name || null;
}

// ============================================
// Welcome Series Helper Functions (Requirements 6.1, 6.2, 6.3)
// ============================================

/**
 * Schedules an email to be sent at a future time
 * Used for onboarding sequences with delays
 */
async function scheduleEmail(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  templateId: EmailTemplate,
  scheduledFor: Date,
  payload: Record<string, unknown> = {}
): Promise<{ success: boolean; queueId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('automation_queue')
      .insert({
        user_id: userId,
        template_id: templateId,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
        payload,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error scheduling email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Scheduled ${templateId} for user ${userId} at ${scheduledFor.toISOString()}`);
    return { success: true, queueId: data.id };
  } catch (err) {
    console.error('Exception scheduling email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Checks if user has created any content (lesson plans, unit plans, or activities)
 * Used to determine if onboarding-day1 should be sent
 * Requirement 6.2: Only send if user hasn't created content
 */
async function hasUserCreatedContent(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  try {
    // Check lesson_plans
    const { count: lessonCount } = await supabase
      .from('lesson_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (lessonCount && lessonCount > 0) {
      return true;
    }

    // Check unit_plans
    const { count: unitCount } = await supabase
      .from('unit_plans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (unitCount && unitCount > 0) {
      return true;
    }

    // Check generated_activities (if table exists)
    const { count: activityCount } = await supabase
      .from('generated_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (activityCount && activityCount > 0) {
      return true;
    }

    return false;
  } catch (err) {
    // If tables don't exist or error, assume no content
    console.log('Error checking user content (may be expected):', err);
    return false;
  }
}

/**
 * Cancels pending scheduled emails for a user and template
 * Used when user takes action that makes the email unnecessary
 */
async function cancelScheduledEmail(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  templateId: EmailTemplate
): Promise<void> {
  try {
    await supabase
      .from('automation_queue')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .eq('status', 'pending');
    
    console.log(`Cancelled pending ${templateId} for user ${userId}`);
  } catch (err) {
    console.error('Error cancelling scheduled email:', err);
  }
}

/**
 * Calls the send-email Edge Function
 */
async function callSendEmail(
  templateId: EmailTemplate,
  to: string,
  userId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Missing Supabase configuration' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        to,
        templateId,
        userId,
        data,
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error calling send-email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Event Handlers (Requirement 11.5)
// ============================================

/**
 * Handles user.created event
 * Triggers welcome email for new users and schedules onboarding series
 * Requirements: 6.1, 6.2, 6.3
 */
async function handleUserCreated(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof UserCreatedPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId, payload } = trigger;
  const { email, name } = payload;

  // Check marketing preferences
  const { data: prefs } = await supabase
    .from('marketing_preferences')
    .select('lgpd_consent')
    .eq('user_id', userId)
    .single();

  // For welcome email, we send even without explicit consent (it's transactional-ish)
  // But we respect if they explicitly opted out
  if (prefs && prefs.lgpd_consent === false) {
    return { success: true, action: 'skipped_no_consent' };
  }

  const userName = name || 'Professor';
  const actions: string[] = [];

  // 1. Send welcome email immediately (Requirement 6.1)
  const welcomeResult = await callSendEmail('welcome', email, userId, {
    userName,
  });

  if (welcomeResult.success) {
    actions.push('sent_welcome_email');
  } else {
    console.error('Failed to send welcome email:', welcomeResult.error);
  }

  // 2. Schedule onboarding-day1 for 24h later (Requirement 6.2)
  // This will be sent only if user hasn't created content
  const day1ScheduledFor = new Date();
  day1ScheduledFor.setHours(day1ScheduledFor.getHours() + 24);
  
  const day1Result = await scheduleEmail(supabase, userId, 'onboarding-day1', day1ScheduledFor, {
    email,
    userName,
  });

  if (day1Result.success) {
    actions.push('scheduled_onboarding_day1');
  }

  // 3. Schedule onboarding-day3 for 72h later (Requirement 6.3)
  const day3ScheduledFor = new Date();
  day3ScheduledFor.setHours(day3ScheduledFor.getHours() + 72);
  
  const day3Result = await scheduleEmail(supabase, userId, 'onboarding-day3', day3ScheduledFor, {
    email,
    userName,
  });

  if (day3Result.success) {
    actions.push('scheduled_onboarding_day3');
  }

  return { 
    success: welcomeResult.success, 
    action: actions.join(', '),
    error: welcomeResult.error,
  };
}

/**
 * Handles usage.updated event from database webhook
 * Checks thresholds and triggers appropriate alerts
 * Requirements: 5.1, 5.2
 */
async function handleUsageUpdated(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof UsageUpdatedPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId, payload } = trigger;
  const { currentUsage, limit, tier } = payload;

  // Only trigger alerts for free tier users
  if (tier !== 'free') {
    return { success: true, action: 'skipped_premium_user' };
  }

  const usagePercent = Math.round((currentUsage / limit) * 100);

  // Check 100% threshold first (Requirement 5.2)
  if (usagePercent >= 100) {
    return await handleUsageThreshold(supabase, {
      event: 'usage.threshold_100',
      userId,
      payload: { usagePercent: 100, currentUsage, limit, tier },
    });
  }

  // Check 80% threshold (Requirement 5.1)
  if (usagePercent >= 80) {
    return await handleUsageThreshold(supabase, {
      event: 'usage.threshold_80',
      userId,
      payload: { usagePercent, currentUsage, limit, tier },
    });
  }

  return { success: true, action: 'no_threshold_reached' };
}

/**
 * Handles usage threshold events (80% and 100%)
 * Requirements: 5.1, 5.2, 5.4
 */
async function handleUsageThreshold(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof UsageThresholdPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { event, userId, payload } = trigger;
  const { usagePercent, currentUsage, limit } = payload;

  const templateId: EmailTemplate = event === 'usage.threshold_100' 
    ? 'usage-warning-100' 
    : 'usage-warning-80';

  // Check cooldown (Requirement 5.4)
  const cooldownConfig = COOLDOWN_CONFIG[templateId];
  if (cooldownConfig) {
    const cooldownCheck = await checkCooldown(
      supabase,
      userId,
      templateId,
      cooldownConfig.cooldownDays
    );

    if (!cooldownCheck.allowed) {
      console.log(`Cooldown active for ${templateId}, last sent: ${cooldownCheck.lastSentAt}`);
      return { success: true, action: 'skipped_cooldown' };
    }
  }

  // Get user email
  const email = await getUserEmail(supabase, userId);
  if (!email) {
    return { success: false, error: 'User email not found' };
  }

  // Get user name
  const userName = await getUserName(supabase, userId);

  // Send the email
  const result = await callSendEmail(templateId, email, userId, {
    userName: userName || 'Professor',
    usagePercent,
    currentUsage,
    limit,
    planName: 'Gratuito',
    upgradeUrl: 'https://educasol.com.br/upgrade',
  });

  if (result.success) {
    return { success: true, action: `sent_${templateId}` };
  }

  return { success: false, error: result.error };
}

/**
 * Handles payment.confirmed event
 * Triggers premium welcome email
 */
async function handlePaymentConfirmed(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof PaymentPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId } = trigger;

  const email = await getUserEmail(supabase, userId);
  if (!email) {
    return { success: false, error: 'User email not found' };
  }

  const userName = await getUserName(supabase, userId);

  const result = await callSendEmail('premium-welcome', email, userId, {
    userName: userName || 'Professor',
  });

  if (result.success) {
    return { success: true, action: 'sent_premium_welcome' };
  }

  return { success: false, error: result.error };
}

/**
 * Handles payment.failed event
 * Triggers payment failed email
 */
async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof PaymentPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId } = trigger;

  const email = await getUserEmail(supabase, userId);
  if (!email) {
    return { success: false, error: 'User email not found' };
  }

  const userName = await getUserName(supabase, userId);

  const result = await callSendEmail('payment-failed', email, userId, {
    userName: userName || 'Professor',
    billingUrl: 'https://educasol.com.br/settings/billing',
  });

  if (result.success) {
    return { success: true, action: 'sent_payment_failed' };
  }

  return { success: false, error: result.error };
}

/**
 * Handles subscription.cancelled event
 * Triggers churn survey email
 */
async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof SubscriptionCancelledPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId } = trigger;

  const email = await getUserEmail(supabase, userId);
  if (!email) {
    return { success: false, error: 'User email not found' };
  }

  const userName = await getUserName(supabase, userId);

  const result = await callSendEmail('churn-survey', email, userId, {
    userName: userName || 'Professor',
    surveyUrl: 'https://educasol.com.br/feedback',
  });

  if (result.success) {
    return { success: true, action: 'sent_churn_survey' };
  }

  return { success: false, error: result.error };
}

/**
 * Handles user.inactive_14d event
 * Triggers re-engagement email
 */
async function handleInactiveUser(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof InactiveUserPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId } = trigger;

  // Check cooldown
  const cooldownConfig = COOLDOWN_CONFIG['reengagement'];
  if (cooldownConfig) {
    const cooldownCheck = await checkCooldown(
      supabase,
      userId,
      'reengagement',
      cooldownConfig.cooldownDays
    );

    if (!cooldownCheck.allowed) {
      return { success: true, action: 'skipped_cooldown' };
    }
  }

  const email = await getUserEmail(supabase, userId);
  if (!email) {
    return { success: false, error: 'User email not found' };
  }

  const userName = await getUserName(supabase, userId);

  const result = await callSendEmail('reengagement', email, userId, {
    userName: userName || 'Professor',
  });

  if (result.success) {
    return { success: true, action: 'sent_reengagement' };
  }

  return { success: false, error: result.error };
}

/**
 * Handles weekly.summary event
 * Triggers activity summary email
 */
async function handleWeeklySummary(
  supabase: ReturnType<typeof createClient>,
  trigger: z.infer<typeof WeeklySummaryPayloadSchema>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const { userId, payload } = trigger;
  const { weekStartDate, weekEndDate, plansCreated, activitiesGenerated, assessmentsCreated } = payload;

  // Check if user had any activity (Requirement 9.4)
  const totalActivity = (plansCreated || 0) + (activitiesGenerated || 0) + (assessmentsCreated || 0);
  if (totalActivity === 0) {
    return { success: true, action: 'skipped_no_activity' };
  }

  // Check cooldown
  const cooldownConfig = COOLDOWN_CONFIG['activity-summary'];
  if (cooldownConfig) {
    const cooldownCheck = await checkCooldown(
      supabase,
      userId,
      'activity-summary',
      cooldownConfig.cooldownDays
    );

    if (!cooldownCheck.allowed) {
      return { success: true, action: 'skipped_cooldown' };
    }
  }

  const email = await getUserEmail(supabase, userId);
  if (!email) {
    return { success: false, error: 'User email not found' };
  }

  const userName = await getUserName(supabase, userId);

  const result = await callSendEmail('activity-summary', email, userId, {
    userName: userName || 'Professor',
    weekStartDate,
    weekEndDate,
    plansCreated: plansCreated || 0,
    activitiesGenerated: activitiesGenerated || 0,
    assessmentsCreated: assessmentsCreated || 0,
  });

  if (result.success) {
    return { success: true, action: 'sent_activity_summary' };
  }

  return { success: false, error: result.error };
}

/**
 * Processes scheduled emails from automation_queue
 * Called periodically (e.g., every 5 minutes via cron)
 * Requirements: 6.2, 6.3
 */
async function handleProcessScheduledEmails(
  supabase: ReturnType<typeof createClient>
): Promise<{ success: boolean; action?: string; error?: string }> {
  const now = new Date();
  const processedEmails: string[] = [];
  const errors: string[] = [];

  try {
    // Get all pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return { success: true, action: 'no_pending_emails' };
    }

    console.log(`Processing ${pendingEmails.length} scheduled emails`);

    for (const queueItem of pendingEmails) {
      const { id, user_id, template_id, payload } = queueItem;
      
      try {
        // Check if user still exists and get their email
        const email = await getUserEmail(supabase, user_id);
        if (!email) {
          // User deleted, cancel the email
          await supabase
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', id);
          continue;
        }

        // Check marketing preferences for onboarding emails
        const { data: prefs } = await supabase
          .from('marketing_preferences')
          .select('lgpd_consent')
          .eq('user_id', user_id)
          .single();

        if (prefs && prefs.lgpd_consent === false) {
          // User opted out, cancel the email
          await supabase
            .from('automation_queue')
            .update({ status: 'cancelled' })
            .eq('id', id);
          console.log(`Cancelled ${template_id} for user ${user_id} - no consent`);
          continue;
        }

        // Special handling for onboarding-day1: check if user created content
        // Requirement 6.2: Only send if user hasn't created content
        if (template_id === 'onboarding-day1') {
          const hasContent = await hasUserCreatedContent(supabase, user_id);
          if (hasContent) {
            // User already created content, cancel the email
            await supabase
              .from('automation_queue')
              .update({ status: 'cancelled' })
              .eq('id', id);
            console.log(`Cancelled onboarding-day1 for user ${user_id} - already created content`);
            continue;
          }
        }

        // Get user name
        const userName = await getUserName(supabase, user_id) || payload?.userName || 'Professor';

        // Send the email
        const sendResult = await callSendEmail(
          template_id as EmailTemplate,
          email,
          user_id,
          {
            ...payload,
            userName,
          }
        );

        if (sendResult.success) {
          // Mark as sent
          await supabase
            .from('automation_queue')
            .update({ status: 'sent' })
            .eq('id', id);
          processedEmails.push(`${template_id}:${user_id}`);
        } else {
          errors.push(`${template_id}:${user_id}:${sendResult.error}`);
          console.error(`Failed to send ${template_id} to ${user_id}:`, sendResult.error);
        }
      } catch (itemError) {
        console.error(`Error processing queue item ${id}:`, itemError);
        errors.push(`${template_id}:${user_id}:${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }

    const action = processedEmails.length > 0 
      ? `processed_${processedEmails.length}_emails` 
      : 'no_emails_sent';

    return { 
      success: true, 
      action: errors.length > 0 ? `${action}_with_${errors.length}_errors` : action,
    };
  } catch (err) {
    console.error('Error in handleProcessScheduledEmails:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================
// Main Event Router
// ============================================

/**
 * Routes automation events to appropriate handlers
 * Requirement 11.5: Execute automation when conditions are met
 */
async function routeAutomationEvent(
  supabase: ReturnType<typeof createClient>,
  trigger: AutomationTrigger
): Promise<{ success: boolean; action?: string; error?: string }> {
  console.log(`Routing automation event: ${trigger.event} for user ${trigger.userId}`);

  switch (trigger.event) {
    case 'user.created':
      return handleUserCreated(supabase, trigger as z.infer<typeof UserCreatedPayloadSchema>);
    
    case 'usage.updated':
      return handleUsageUpdated(supabase, trigger as z.infer<typeof UsageUpdatedPayloadSchema>);
    
    case 'usage.threshold_80':
    case 'usage.threshold_100':
      return handleUsageThreshold(supabase, trigger as z.infer<typeof UsageThresholdPayloadSchema>);
    
    case 'payment.confirmed':
      return handlePaymentConfirmed(supabase, trigger as z.infer<typeof PaymentPayloadSchema>);
    
    case 'payment.failed':
      return handlePaymentFailed(supabase, trigger as z.infer<typeof PaymentPayloadSchema>);
    
    case 'subscription.cancelled':
      return handleSubscriptionCancelled(supabase, trigger as z.infer<typeof SubscriptionCancelledPayloadSchema>);
    
    case 'user.inactive_14d':
      return handleInactiveUser(supabase, trigger as z.infer<typeof InactiveUserPayloadSchema>);
    
    case 'weekly.summary':
      return handleWeeklySummary(supabase, trigger as z.infer<typeof WeeklySummaryPayloadSchema>);
    
    case 'process.scheduled_emails':
      return handleProcessScheduledEmails(supabase);
    
    default:
      return { success: false, error: `Unknown event type: ${(trigger as { event: string }).event}` };
  }
}

// ============================================
// Main Handler
// ============================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const body = await req.json();
    
    console.log('Received automation trigger:', JSON.stringify(body, null, 2));

    // Validate payload (Requirement 11.4)
    const validationResult = AutomationTriggerSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Payload validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid payload',
          details: validationResult.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const trigger = validationResult.data;

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Route to appropriate handler (Requirement 11.5)
    const result = await routeAutomationEvent(supabase, trigger);

    console.log(`Automation result for ${trigger.event}:`, result);

    return new Response(
      JSON.stringify({
        success: result.success,
        event: trigger.event,
        userId: trigger.userId,
        action: result.action,
        error: result.error,
      }),
      {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in trigger-automation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
