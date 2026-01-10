/**
 * Email Utilities Module
 * 
 * Shared utilities for email operations across Edge Functions.
 * Provides email category classification, preference checking, and template types.
 * 
 * Requirements: 1.1, 1.2, 2.6, 6.4
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Email template types
export type EmailTemplate = 
  | 'welcome'
  | 'usage-warning-80'
  | 'usage-warning-100'
  | 'usage-followup'
  | 'reset-password'
  | 'premium-welcome'
  | 'payment-failed'
  | 'activity-summary'
  | 'reengagement'
  | 'churn-survey'
  | 'onboarding-day1'
  | 'onboarding-day3';

// Email category classification
export type EmailCategory = 'transactional' | 'notification' | 'marketing';

/**
 * Classifies email templates by category
 * - Transactional: Direct user actions (password reset, payment)
 * - Notification: Product alerts (usage warnings, activity summaries)
 * - Marketing: Onboarding, re-engagement, newsletters
 * 
 * Requirements: 2.6 (transactional emails don't need opt-in)
 */
export function getEmailCategory(templateId: EmailTemplate): EmailCategory {
  const transactionalTemplates: EmailTemplate[] = [
    'reset-password',
    'premium-welcome',
    'payment-failed',
  ];
  
  const notificationTemplates: EmailTemplate[] = [
    'usage-warning-80',
    'usage-warning-100',
    'usage-followup',
    'activity-summary',
  ];
  
  if (transactionalTemplates.includes(templateId)) {
    return 'transactional';
  }
  
  if (notificationTemplates.includes(templateId)) {
    return 'notification';
  }
  
  return 'marketing';
}

/**
 * Template subject mapping
 */
export const TEMPLATE_SUBJECTS: Record<EmailTemplate, string> = {
  'welcome': 'Bem-vindo ao Educa Sol! 🎉',
  'usage-warning-80': 'Você está chegando ao limite de uso',
  'usage-warning-100': 'Limite de uso atingido',
  'usage-followup': 'Desbloqueie todo o potencial do Educa Sol',
  'reset-password': 'Redefinir sua senha - Educa Sol',
  'premium-welcome': 'Parabéns! Você agora é Premium 🌟',
  'payment-failed': 'Problema com seu pagamento - Ação necessária',
  'activity-summary': 'Seu resumo semanal - Educa Sol',
  'reengagement': 'Sentimos sua falta! 💙',
  'churn-survey': 'Nos ajude a melhorar - Pesquisa rápida',
  'onboarding-day1': 'Precisa de ajuda com a BNCC?',
  'onboarding-day3': 'Descubra funcionalidades avançadas',
};

/**
 * Marketing preferences check result
 */
export interface PreferenceCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Checks if user has opted in for the email category
 * Returns true for transactional emails (no opt-in required)
 * 
 * Requirements: 2.6 (transactional bypass), 6.4 (respect preferences)
 */
export async function checkMarketingPreferences(
  supabase: SupabaseClient,
  userId: string,
  category: EmailCategory
): Promise<PreferenceCheckResult> {
  // Transactional emails don't require opt-in (Requirement 2.6)
  if (category === 'transactional') {
    return { allowed: true };
  }

  try {
    const { data: prefs, error } = await supabase
      .from('marketing_preferences')
      .select('lgpd_consent, newsletter, product_updates')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching marketing preferences:', error);
      // Fail-safe: don't send marketing emails if we can't verify preferences
      return { allowed: false, reason: 'Could not verify preferences' };
    }

    if (!prefs) {
      return { allowed: false, reason: 'No preferences found' };
    }

    // Check LGPD consent first
    if (!prefs.lgpd_consent) {
      return { allowed: false, reason: 'LGPD consent not given' };
    }

    // Check specific preference based on category
    if (category === 'notification' && !prefs.product_updates) {
      return { allowed: false, reason: 'Product updates not enabled' };
    }

    if (category === 'marketing' && !prefs.newsletter) {
      return { allowed: false, reason: 'Newsletter not enabled' };
    }

    return { allowed: true };
  } catch (err) {
    console.error('Exception checking preferences:', err);
    return { allowed: false, reason: 'Error checking preferences' };
  }
}

/**
 * Logs email to email_logs table
 * 
 * Requirement: 1.2 (email logging)
 */
export async function logEmail(
  supabase: SupabaseClient,
  userId: string | null,
  templateId: string,
  recipientEmail: string,
  subject: string,
  status: 'sent' | 'failed',
  messageId?: string,
  errorMessage?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { error } = await supabase.from('email_logs').insert({
      user_id: userId,
      template_id: templateId,
      recipient_email: recipientEmail,
      subject,
      status,
      resend_message_id: messageId,
      error_message: errorMessage,
      metadata: metadata || {},
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging email:', error);
    }
  } catch (err) {
    console.error('Exception logging email:', err);
  }
}

/**
 * Checks if an email was recently sent to avoid spam
 * 
 * Requirement: 5.4 (cooldown between similar emails)
 */
export async function checkEmailCooldown(
  supabase: SupabaseClient,
  userId: string,
  templateId: string,
  cooldownDays: number = 7
): Promise<{ allowed: boolean; lastSentAt?: string }> {
  try {
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
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking email cooldown:', error);
      // Fail-open: allow sending if we can't check
      return { allowed: true };
    }

    if (data) {
      return { allowed: false, lastSentAt: data.sent_at };
    }

    return { allowed: true };
  } catch (err) {
    console.error('Exception checking cooldown:', err);
    return { allowed: true };
  }
}

/**
 * Retry configuration for email sending
 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: [1000, 5000, 15000],
  retryableCodes: ['RATE_LIMITED', 'API_ERROR', 'NETWORK_ERROR'],
};

/**
 * Delays execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Generates an unsubscribe token for a user
 * Token is base64 encoded JSON with userId, email, and expiration
 * 
 * Requirement: 2.4 (unsubscribe link in marketing emails)
 */
export function generateUnsubscribeToken(userId: string, email: string): string {
  const tokenData = {
    userId,
    email,
    exp: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days expiration
  };
  
  // In Deno, use btoa for base64 encoding
  return btoa(JSON.stringify(tokenData));
}

/**
 * Generates the full unsubscribe URL for an email
 * 
 * Requirement: 2.4 (unsubscribe link)
 */
export function getUnsubscribeUrl(userId: string, email: string, baseUrl?: string): string {
  const token = generateUnsubscribeToken(userId, email);
  const url = baseUrl || 'https://educasol.com.br';
  return `${url}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Generates the preferences management URL for an email
 * 
 * Requirement: 2.5 (preferences page)
 */
export function getPreferencesUrl(userId: string, email: string, baseUrl?: string): string {
  const token = generateUnsubscribeToken(userId, email);
  const url = baseUrl || 'https://educasol.com.br';
  return `${url}/api/unsubscribe?token=${encodeURIComponent(token)}&action=preferences`;
}
