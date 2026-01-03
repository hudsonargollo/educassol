/**
 * useUsage Hook
 * 
 * Manages usage state for the freemium tier system.
 * Queries usage_logs for current month counts and provides
 * limit checking and percentage calculation functions.
 * 
 * Requirements: 1.3, 5.1
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tier, GenerationType } from '@/integrations/supabase/types';

/**
 * Limit category types that map to tier limits
 */
export type LimitCategory = 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';

/**
 * Tier limits configuration (mirrors backend)
 */
export interface TierLimits {
  lessonPlans: number | null;  // null = unlimited
  activities: number | null;
  assessments: number | null;
  fileUploads: number | null;
  maxFileSizeMB: number;
  exportFormats: ('pdf' | 'docx' | 'pptx' | 'google-slides')[];
}

/**
 * Usage data for a single category
 */
export interface UsageData {
  used: number;
  limit: number | null;
}

/**
 * Current billing period information
 */
export interface BillingPeriod {
  start: Date;
  end: Date;
  daysRemaining: number;
}

/**
 * Complete usage state
 */
export interface UsageState {
  tier: Tier;
  currentPeriod: BillingPeriod;
  usage: {
    lessonPlans: UsageData;
    activities: UsageData;
    assessments: UsageData;
    fileUploads: UsageData;
  };
  isLoading: boolean;
  error: string | null;
}

/**
 * Return type for the useUsage hook
 */
export interface UseUsageReturn extends UsageState {
  checkLimit: (type: LimitCategory) => boolean;
  refreshUsage: () => Promise<void>;
  getUsagePercentage: (type: LimitCategory) => number;
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
  },
  premium: {
    lessonPlans: null,
    activities: null,
    assessments: null,
    fileUploads: null,
    maxFileSizeMB: 100,
    exportFormats: ['pdf', 'docx', 'pptx', 'google-slides'],
  },
  enterprise: {
    lessonPlans: null,
    activities: null,
    assessments: null,
    fileUploads: null,
    maxFileSizeMB: 500,
    exportFormats: ['pdf', 'docx', 'pptx', 'google-slides'],
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
function getTypesForCategory(category: LimitCategory): GenerationType[] {
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
 * Gets the start of the current month
 */
function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Gets the end of the current month
 */
function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Calculates days remaining until end of month
 */
function getDaysRemaining(): number {
  const now = new Date();
  const endOfMonth = getEndOfMonth();
  const diffTime = endOfMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Creates the initial billing period
 */
function createBillingPeriod(): BillingPeriod {
  return {
    start: getStartOfMonth(),
    end: getEndOfMonth(),
    daysRemaining: getDaysRemaining(),
  };
}

/**
 * Creates initial usage state with default values
 */
function createInitialUsageState(tier: Tier = 'free'): UsageState {
  const limits = TIER_LIMITS[tier];
  return {
    tier,
    currentPeriod: createBillingPeriod(),
    usage: {
      lessonPlans: { used: 0, limit: limits.lessonPlans },
      activities: { used: 0, limit: limits.activities },
      assessments: { used: 0, limit: limits.assessments },
      fileUploads: { used: 0, limit: limits.fileUploads },
    },
    isLoading: true,
    error: null,
  };
}

/**
 * Custom hook for managing usage state
 * 
 * Requirements:
 * - 1.3: Query usage_logs for current month counts grouped by generation_type
 * - 5.1: Display circular progress rings for each generation type
 * 
 * @returns Usage state and control functions
 */
export function useUsage(): UseUsageReturn {
  const [state, setState] = useState<UsageState>(createInitialUsageState());

  /**
   * Fetches usage data from the database
   * Requirement 1.3: Return current month's count grouped by generation_type
   */
  const fetchUsage = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Not authenticated',
        }));
        return;
      }

      // Get user's tier from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Profile might not exist yet for new users - use defaults
      const tier: Tier = (profile?.tier as Tier) || 'free';
      const limits = TIER_LIMITS[tier];

      // Get start of current month for query
      const startOfMonth = getStartOfMonth();

      // Query usage_logs for current month
      const { data: usageLogs, error: usageError } = await supabase
        .from('usage_logs')
        .select('generation_type')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (usageError) {
        console.error('Error fetching usage logs:', usageError);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch usage data',
        }));
        return;
      }

      // Count usage by category
      const usageCounts = {
        lessonPlans: 0,
        activities: 0,
        assessments: 0,
        fileUploads: 0,
      };

      if (usageLogs) {
        for (const log of usageLogs) {
          const category = mapGenerationTypeToCategory(log.generation_type as GenerationType);
          usageCounts[category]++;
        }
      }

      // Update state with fetched data
      setState({
        tier,
        currentPeriod: createBillingPeriod(),
        usage: {
          lessonPlans: { used: usageCounts.lessonPlans, limit: limits.lessonPlans },
          activities: { used: usageCounts.activities, limit: limits.activities },
          assessments: { used: usageCounts.assessments, limit: limits.assessments },
          fileUploads: { used: usageCounts.fileUploads, limit: limits.fileUploads },
        },
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Error in fetchUsage:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, []);

  /**
   * Refresh usage data
   */
  const refreshUsage = useCallback(async () => {
    await fetchUsage();
  }, [fetchUsage]);

  /**
   * Check if user has remaining usage for a category
   * Returns true if user can generate, false if limit reached
   */
  const checkLimit = useCallback((type: LimitCategory): boolean => {
    const usageData = state.usage[type];
    
    // If unlimited (null limit), always allow
    if (usageData.limit === null) {
      return true;
    }
    
    return usageData.used < usageData.limit;
  }, [state.usage]);

  /**
   * Get usage percentage for a category
   * Returns 0-100 for limited tiers, 0 for unlimited
   */
  const getUsagePercentage = useCallback((type: LimitCategory): number => {
    const usageData = state.usage[type];
    
    // If unlimited, return 0 (no progress to show)
    if (usageData.limit === null) {
      return 0;
    }
    
    // Calculate percentage, capped at 100
    return Math.min(100, (usageData.used / usageData.limit) * 100);
  }, [state.usage]);

  // Fetch usage on mount and when auth state changes
  useEffect(() => {
    fetchUsage();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUsage();
      } else if (event === 'SIGNED_OUT') {
        setState(createInitialUsageState());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUsage]);

  return {
    // State
    tier: state.tier,
    currentPeriod: state.currentPeriod,
    usage: state.usage,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    checkLimit,
    refreshUsage,
    getUsagePercentage,
  };
}

export default useUsage;
