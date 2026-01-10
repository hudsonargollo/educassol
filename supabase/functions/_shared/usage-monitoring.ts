/**
 * Usage Monitoring Module
 * 
 * Shared module for monitoring usage thresholds and triggering email alerts.
 * Implements threshold checking (80%, 100%) and cooldown verification.
 * 
 * Requirements: 5.1, 5.2, 5.4
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// ============================================
// Type Definitions
// ============================================

export type Tier = 'free' | 'premium' | 'enterprise';

export type LimitCategory = 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';

export interface UsageThresholdResult {
  thresholdReached: '80' | '100' | null;
  usagePercent: number;
  currentUsage: number;
  limit: number;
  shouldTriggerAlert: boolean;
  cooldownActive: boolean;
  lastAlertSentAt?: string;
}

export interface TriggerAutomationPayload {
  event: 'usage.threshold_80' | 'usage.threshold_100';
  userId: string;
  timestamp: string;
  payload: {
    usagePercent: number;
    currentUsage: number;
    limit: number;
    tier: Tier;
  };
}

// ============================================
// Constants
// ============================================

// Cooldown period in days for usage alerts (Requirement 5.4)
export const USAGE_ALERT_COOLDOWN_DAYS = 7;

// Threshold percentages
export const THRESHOLD_80 = 80;
export const THRESHOLD_100 = 100;

// Template IDs for usage alerts
export const USAGE_TEMPLATE_80 = 'usage-warning-80';
export const USAGE_TEMPLATE_100 = 'usage-warning-100';

// ============================================
// Helper Functions
// ============================================

/**
 * Gets the start of the current month
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Calculates usage percentage
 */
export function calculateUsagePercent(currentUsage: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((currentUsage / limit) * 100);
}

/**
 * Determines which threshold was reached (if any)
 */
export function determineThreshold(usagePercent: number): '80' | '100' | null {
  if (usagePercent >= THRESHOLD_100) {
    return '100';
  }
  if (usagePercent >= THRESHOLD_80) {
    return '80';
  }
  return null;
}

// ============================================
// Core Functions
// ============================================

/**
 * Checks if a usage alert was sent recently (within cooldown period)
 * Requirement 5.4: Verify last_email_date to avoid spam
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param templateId - The email template ID to check
 * @returns Object with cooldown status and last sent date
 */
export async function checkUsageAlertCooldown(
  supabase: SupabaseClient,
  userId: string,
  templateId: string
): Promise<{ cooldownActive: boolean; lastSentAt?: string }> {
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() - USAGE_ALERT_COOLDOWN_DAYS);

  try {
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
      console.error('Error checking usage alert cooldown:', error);
      // Fail-safe: allow sending if we can't check
      return { cooldownActive: false };
    }

    if (data && data.length > 0) {
      return { cooldownActive: true, lastSentAt: data[0].sent_at };
    }

    return { cooldownActive: false };
  } catch (err) {
    console.error('Exception checking usage alert cooldown:', err);
    return { cooldownActive: false };
  }
}

/**
 * Gets the current usage count for a user in the current month
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param generationTypes - Array of generation types to count
 * @returns Current usage count
 */
export async function getCurrentMonthUsage(
  supabase: SupabaseClient,
  userId: string,
  generationTypes: string[]
): Promise<number> {
  const startOfMonth = getStartOfMonth();

  try {
    const { count, error } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('generation_type', generationTypes)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      console.error('Error getting current month usage:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Exception getting current month usage:', err);
    return 0;
  }
}

/**
 * Checks usage thresholds and determines if an alert should be triggered
 * Requirements: 5.1, 5.2, 5.4
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param currentUsage - Current usage count
 * @param limit - Usage limit for the tier
 * @returns UsageThresholdResult with threshold status and alert decision
 */
export async function checkUsageThresholds(
  supabase: SupabaseClient,
  userId: string,
  currentUsage: number,
  limit: number
): Promise<UsageThresholdResult> {
  const usagePercent = calculateUsagePercent(currentUsage, limit);
  const thresholdReached = determineThreshold(usagePercent);

  // If no threshold reached, no alert needed
  if (!thresholdReached) {
    return {
      thresholdReached: null,
      usagePercent,
      currentUsage,
      limit,
      shouldTriggerAlert: false,
      cooldownActive: false,
    };
  }

  // Determine which template to check for cooldown
  const templateId = thresholdReached === '100' ? USAGE_TEMPLATE_100 : USAGE_TEMPLATE_80;

  // Check cooldown (Requirement 5.4)
  const cooldownCheck = await checkUsageAlertCooldown(supabase, userId, templateId);

  return {
    thresholdReached,
    usagePercent,
    currentUsage,
    limit,
    shouldTriggerAlert: !cooldownCheck.cooldownActive,
    cooldownActive: cooldownCheck.cooldownActive,
    lastAlertSentAt: cooldownCheck.lastSentAt,
  };
}

/**
 * Creates the payload for trigger-automation Edge Function
 * 
 * @param userId - The user's ID
 * @param thresholdResult - Result from checkUsageThresholds
 * @param tier - User's current tier
 * @returns TriggerAutomationPayload ready to send
 */
export function createTriggerPayload(
  userId: string,
  thresholdResult: UsageThresholdResult,
  tier: Tier
): TriggerAutomationPayload | null {
  if (!thresholdResult.thresholdReached || !thresholdResult.shouldTriggerAlert) {
    return null;
  }

  const event = thresholdResult.thresholdReached === '100' 
    ? 'usage.threshold_100' 
    : 'usage.threshold_80';

  return {
    event,
    userId,
    timestamp: new Date().toISOString(),
    payload: {
      usagePercent: thresholdResult.usagePercent,
      currentUsage: thresholdResult.currentUsage,
      limit: thresholdResult.limit,
      tier,
    },
  };
}

/**
 * Calls the trigger-automation Edge Function to send usage alert
 * 
 * @param payload - The automation trigger payload
 * @returns Success status and any error message
 */
export async function triggerUsageAlert(
  payload: TriggerAutomationPayload
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: 'Missing Supabase configuration' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/trigger-automation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Failed to trigger automation' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error triggering usage alert:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Main function to check and trigger usage alerts after a generation
 * This should be called after recording usage in any generation Edge Function
 * 
 * Requirements: 5.1, 5.2, 5.4
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param currentUsage - Current usage count (after the new generation)
 * @param limit - Usage limit for the tier
 * @param tier - User's current tier
 * @returns Result of the threshold check and any triggered alert
 */
export async function checkAndTriggerUsageAlert(
  supabase: SupabaseClient,
  userId: string,
  currentUsage: number,
  limit: number,
  tier: Tier
): Promise<{
  thresholdResult: UsageThresholdResult;
  alertTriggered: boolean;
  error?: string;
}> {
  // Only check for free tier users
  if (tier !== 'free') {
    return {
      thresholdResult: {
        thresholdReached: null,
        usagePercent: 0,
        currentUsage,
        limit,
        shouldTriggerAlert: false,
        cooldownActive: false,
      },
      alertTriggered: false,
    };
  }

  // Check thresholds
  const thresholdResult = await checkUsageThresholds(supabase, userId, currentUsage, limit);

  // If no alert should be triggered, return early
  if (!thresholdResult.shouldTriggerAlert) {
    return {
      thresholdResult,
      alertTriggered: false,
    };
  }

  // Create and send trigger payload
  const payload = createTriggerPayload(userId, thresholdResult, tier);
  
  if (!payload) {
    return {
      thresholdResult,
      alertTriggered: false,
    };
  }

  const triggerResult = await triggerUsageAlert(payload);

  return {
    thresholdResult,
    alertTriggered: triggerResult.success,
    error: triggerResult.error,
  };
}
