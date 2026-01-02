/**
 * Usage Limits Module
 * 
 * Shared module for enforcing tier-based usage limits across Edge Functions.
 * Implements checkUsageLimit, recordUsage, and TIER_LIMITS configuration.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Type definitions
export type GenerationType =
  | 'lesson-plan'
  | 'activity'
  | 'worksheet'
  | 'quiz'
  | 'reading'
  | 'slides'
  | 'assessment'
  | 'file-upload';

export type Tier = 'free' | 'premium' | 'enterprise';

export type LimitCategory = 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';

export interface TierLimits {
  lessonPlans: number | null;  // null = unlimited
  activities: number | null;
  assessments: number | null;
  fileUploads: number | null;
  maxFileSizeMB: number;
  exportFormats: ('pdf' | 'docx' | 'pptx' | 'google-slides')[];
  aiModel: 'gemini-flash' | 'gemini-pro';
}

export interface LimitCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number | null;
  tier: Tier;
}

/**
 * Tier limits configuration
 * Requirements: 2.1, 2.2, 2.3, 2.4 (Free tier limits)
 * Requirements: 3.1, 3.2, 3.3, 3.4 (Premium tier unlimited)
 */
export const TIER_LIMITS: Record<Tier, TierLimits> = {
  free: {
    lessonPlans: 5,
    activities: 10,
    assessments: 3,
    fileUploads: 2,
    maxFileSizeMB: 15,
    exportFormats: ['pdf'],
    aiModel: 'gemini-flash',
  },
  premium: {
    lessonPlans: null,
    activities: null,
    assessments: null,
    fileUploads: null,
    maxFileSizeMB: 100,
    exportFormats: ['pdf', 'docx', 'pptx', 'google-slides'],
    aiModel: 'gemini-pro',
  },
  enterprise: {
    lessonPlans: null,
    activities: null,
    assessments: null,
    fileUploads: null,
    maxFileSizeMB: 500,
    exportFormats: ['pdf', 'docx', 'pptx', 'google-slides'],
    aiModel: 'gemini-pro',
  },
};

/**
 * Maps generation types to their limit categories
 */
export function mapGenerationTypeToCategory(generationType: GenerationType): LimitCategory {
  switch (generationType) {
    case 'lesson-plan':
      return 'lessonPlans';
    case 'activity':
    case 'worksheet':
    case 'quiz':
    case 'reading':
    case 'slides':
      return 'activities';
    case 'assessment':
      return 'assessments';
    case 'file-upload':
      return 'fileUploads';
    default:
      return 'activities';
  }
}

/**
 * Gets all generation types that count toward a limit category
 */
export function getTypesForCategory(category: LimitCategory): GenerationType[] {
  switch (category) {
    case 'lessonPlans':
      return ['lesson-plan'];
    case 'activities':
      return ['activity', 'worksheet', 'quiz', 'reading', 'slides'];
    case 'assessments':
      return ['assessment'];
    case 'fileUploads':
      return ['file-upload'];
    default:
      return [];
  }
}

/**
 * Gets the end of the current month as a Date
 */
export function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Gets the start of the current month as a Date
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Checks if a user has remaining usage for a generation type
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param generationType - The type of generation being attempted
 * @returns LimitCheckResult with allowed status and usage details
 */
export async function checkUsageLimit(
  supabase: SupabaseClient,
  userId: string,
  generationType: GenerationType
): Promise<LimitCheckResult> {
  // Get user's tier from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
  }

  const tier: Tier = (profile?.tier as Tier) || 'free';
  const limits = TIER_LIMITS[tier];
  
  // Map generation type to limit category
  const limitCategory = mapGenerationTypeToCategory(generationType);
  const limit = limits[limitCategory];

  // If unlimited (null), allow the request
  if (limit === null) {
    return { allowed: true, currentUsage: 0, limit: null, tier };
  }

  // Get start of current month for query
  const startOfMonth = getStartOfMonth();

  // Count current month's usage for this category
  const typesForCategory = getTypesForCategory(limitCategory);
  
  const { count, error: countError } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('generation_type', typesForCategory)
    .gte('created_at', startOfMonth.toISOString());

  if (countError) {
    console.error('Error counting usage:', countError);
    // On error, default to allowing (fail open) but log the issue
    return { allowed: true, currentUsage: 0, limit, tier };
  }

  const currentUsage = count || 0;

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    tier,
  };
}

/**
 * Records a usage event after successful generation
 * 
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param generationType - The type of generation completed
 * @param tier - The user's tier at time of generation
 * @param metadata - Optional metadata about the generation
 */
export async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  generationType: GenerationType,
  tier: Tier,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('usage_logs').insert({
    user_id: userId,
    generation_type: generationType,
    tier,
    metadata: metadata || {},
  });

  if (error) {
    console.error('Error recording usage:', error);
    // Don't throw - usage recording failure shouldn't block the user
  }
}

/**
 * Creates rate limit headers for the response
 * 
 * @param limitCheck - The result from checkUsageLimit
 * @returns Headers object with rate limit information
 */
export function createRateLimitHeaders(limitCheck: LimitCheckResult): Record<string, string> {
  const endOfMonth = getEndOfMonth();
  
  return {
    'X-RateLimit-Limit': limitCheck.limit !== null ? String(limitCheck.limit) : 'unlimited',
    'X-RateLimit-Remaining': limitCheck.limit !== null 
      ? String(Math.max(0, limitCheck.limit - limitCheck.currentUsage - 1))
      : 'unlimited',
    'X-RateLimit-Reset': endOfMonth.toISOString(),
  };
}

/**
 * Creates a 402 Payment Required response for limit exceeded
 * 
 * @param limitCheck - The result from checkUsageLimit
 * @param generationType - The type of generation that was blocked
 * @param corsHeaders - CORS headers to include in response
 * @returns Response object with 402 status
 */
export function createLimitExceededResponse(
  limitCheck: LimitCheckResult,
  generationType: GenerationType,
  corsHeaders: Record<string, string>
): Response {
  const limitCategory = mapGenerationTypeToCategory(generationType);
  
  return new Response(
    JSON.stringify({
      error: 'Usage limit exceeded',
      limit_type: limitCategory,
      current_usage: limitCheck.currentUsage,
      limit: limitCheck.limit,
      tier: limitCheck.tier,
    }),
    {
      status: 402,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...createRateLimitHeaders(limitCheck),
      },
    }
  );
}
