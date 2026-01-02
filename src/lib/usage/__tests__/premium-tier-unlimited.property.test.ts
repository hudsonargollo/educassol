import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Type definitions mirroring the Edge Function types
 */
type GenerationType =
  | 'lesson-plan'
  | 'activity'
  | 'worksheet'
  | 'quiz'
  | 'reading'
  | 'slides'
  | 'assessment'
  | 'file-upload';

type Tier = 'free' | 'premium' | 'enterprise';

type LimitCategory = 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';

interface TierLimits {
  lessonPlans: number | null;
  activities: number | null;
  assessments: number | null;
  fileUploads: number | null;
  maxFileSizeMB: number;
  exportFormats: ('pdf' | 'docx' | 'pptx' | 'google-slides')[];
  aiModel: 'gemini-flash' | 'gemini-pro';
}

interface LimitCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number | null;
  tier: Tier;
}

/**
 * Tier limits configuration (mirroring Edge Function config)
 * Requirements: 3.1, 3.2, 3.3, 3.4 (Premium tier unlimited)
 */
const TIER_LIMITS: Record<Tier, TierLimits> = {
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
function mapGenerationTypeToCategory(generationType: GenerationType): LimitCategory {
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
 * Pure function to check if a generation is allowed based on current usage
 * This mirrors the logic in checkUsageLimit but without database calls
 */
function checkLimitPure(
  tier: Tier,
  generationType: GenerationType,
  currentUsage: number
): LimitCheckResult {
  const limits = TIER_LIMITS[tier];
  const limitCategory = mapGenerationTypeToCategory(generationType);
  const limit = limits[limitCategory];

  // If unlimited (null), allow the request
  if (limit === null) {
    return { allowed: true, currentUsage, limit: null, tier };
  }

  return {
    allowed: currentUsage < limit,
    currentUsage,
    limit,
    tier,
  };
}

/**
 * Arbitrary for any generation type
 */
const arbitraryGenerationType = (): fc.Arbitrary<GenerationType> =>
  fc.constantFrom(
    'lesson-plan',
    'activity',
    'worksheet',
    'quiz',
    'reading',
    'slides',
    'assessment',
    'file-upload'
  ) as fc.Arbitrary<GenerationType>;

/**
 * Arbitrary for large usage counts (simulating heavy usage)
 */
const arbitraryLargeUsageCount = (): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: 100000 });

describe('Premium Tier Unlimited Access Property Tests', () => {
  /**
   * **Feature: freemium-platform-pivot, Property 5: Premium Tier Unlimited Access**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
   *
   * *For any* Premium tier user and any generation type, all generation attempts
   * SHALL succeed regardless of the number of previous generations in the current month
   * (assuming no other failures).
   */

  test('Property 5: Premium tier allows unlimited lesson plan generations', () => {
    fc.assert(
      fc.property(arbitraryLargeUsageCount(), (currentUsage) => {
        const result = checkLimitPure('premium', 'lesson-plan', currentUsage);

        // Premium tier should always allow lesson plan generations
        expect(result.allowed).toBe(true);
        expect(result.tier).toBe('premium');
        expect(result.limit).toBeNull();
      })
    );
  });

  test('Property 5: Premium tier allows unlimited activity generations', () => {
    const activityTypes: GenerationType[] = ['activity', 'worksheet', 'quiz', 'reading', 'slides'];

    fc.assert(
      fc.property(
        fc.constantFrom(...activityTypes) as fc.Arbitrary<GenerationType>,
        arbitraryLargeUsageCount(),
        (generationType, currentUsage) => {
          const result = checkLimitPure('premium', generationType, currentUsage);

          // Premium tier should always allow activity generations
          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('premium');
          expect(result.limit).toBeNull();
        }
      )
    );
  });

  test('Property 5: Premium tier allows unlimited assessment generations', () => {
    fc.assert(
      fc.property(arbitraryLargeUsageCount(), (currentUsage) => {
        const result = checkLimitPure('premium', 'assessment', currentUsage);

        // Premium tier should always allow assessment generations
        expect(result.allowed).toBe(true);
        expect(result.tier).toBe('premium');
        expect(result.limit).toBeNull();
      })
    );
  });

  test('Property 5: Premium tier allows unlimited file uploads', () => {
    fc.assert(
      fc.property(arbitraryLargeUsageCount(), (currentUsage) => {
        const result = checkLimitPure('premium', 'file-upload', currentUsage);

        // Premium tier should always allow file uploads
        expect(result.allowed).toBe(true);
        expect(result.tier).toBe('premium');
        expect(result.limit).toBeNull();
      })
    );
  });

  test('Property 5: Premium tier allows any generation type regardless of usage count', () => {
    fc.assert(
      fc.property(
        arbitraryGenerationType(),
        arbitraryLargeUsageCount(),
        (generationType, currentUsage) => {
          const result = checkLimitPure('premium', generationType, currentUsage);

          // Premium tier should always allow any generation type
          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('premium');
          expect(result.limit).toBeNull();
        }
      )
    );
  });

  /**
   * Property 5: Premium tier has null limits for all categories
   */
  test('Property 5: Premium tier configuration has null limits for all categories', () => {
    const premiumLimits = TIER_LIMITS.premium;

    expect(premiumLimits.lessonPlans).toBeNull();
    expect(premiumLimits.activities).toBeNull();
    expect(premiumLimits.assessments).toBeNull();
    expect(premiumLimits.fileUploads).toBeNull();
  });

  /**
   * Property 5: Premium tier uses Gemini Pro model
   */
  test('Property 5: Premium tier uses Gemini Pro AI model', () => {
    const premiumLimits = TIER_LIMITS.premium;

    expect(premiumLimits.aiModel).toBe('gemini-pro');
  });

  /**
   * Property 5: Premium tier has all export formats available
   */
  test('Property 5: Premium tier has all export formats', () => {
    const premiumLimits = TIER_LIMITS.premium;

    expect(premiumLimits.exportFormats).toContain('pdf');
    expect(premiumLimits.exportFormats).toContain('docx');
    expect(premiumLimits.exportFormats).toContain('pptx');
    expect(premiumLimits.exportFormats).toContain('google-slides');
  });

  /**
   * Property 5: Contrast with Free tier - Premium should allow what Free rejects
   */
  test('Property 5: Premium allows generations that would exceed Free tier limits', () => {
    // Test cases where Free tier would reject but Premium should allow
    const testCases: Array<{ type: GenerationType; usageAboveFreeLimit: number }> = [
      { type: 'lesson-plan', usageAboveFreeLimit: 100 },  // Free limit is 5
      { type: 'activity', usageAboveFreeLimit: 500 },     // Free limit is 10
      { type: 'assessment', usageAboveFreeLimit: 50 },    // Free limit is 3
      { type: 'file-upload', usageAboveFreeLimit: 200 },  // Free limit is 2
    ];

    for (const { type, usageAboveFreeLimit } of testCases) {
      // Free tier should reject at this usage level
      const freeResult = checkLimitPure('free', type, usageAboveFreeLimit);
      expect(freeResult.allowed).toBe(false);

      // Premium tier should allow at this usage level
      const premiumResult = checkLimitPure('premium', type, usageAboveFreeLimit);
      expect(premiumResult.allowed).toBe(true);
      expect(premiumResult.limit).toBeNull();
    }
  });

  /**
   * Property 5: Enterprise tier also has unlimited access (same as Premium)
   */
  test('Property 5: Enterprise tier also has unlimited access like Premium', () => {
    fc.assert(
      fc.property(
        arbitraryGenerationType(),
        arbitraryLargeUsageCount(),
        (generationType, currentUsage) => {
          const premiumResult = checkLimitPure('premium', generationType, currentUsage);
          const enterpriseResult = checkLimitPure('enterprise', generationType, currentUsage);

          // Both Premium and Enterprise should have unlimited access
          expect(premiumResult.allowed).toBe(true);
          expect(enterpriseResult.allowed).toBe(true);
          expect(premiumResult.limit).toBeNull();
          expect(enterpriseResult.limit).toBeNull();
        }
      )
    );
  });
});
