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
 * Requirements: 2.1, 2.2, 2.3, 2.4 (Free tier limits)
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
 * Arbitrary for generation types that count toward lesson plans
 */
const arbitraryLessonPlanType = (): fc.Arbitrary<GenerationType> =>
  fc.constant('lesson-plan' as GenerationType);

/**
 * Arbitrary for generation types that count toward activities
 */
const arbitraryActivityType = (): fc.Arbitrary<GenerationType> =>
  fc.constantFrom('activity', 'worksheet', 'quiz', 'reading', 'slides') as fc.Arbitrary<GenerationType>;

/**
 * Arbitrary for generation types that count toward assessments
 */
const arbitraryAssessmentType = (): fc.Arbitrary<GenerationType> =>
  fc.constant('assessment' as GenerationType);

/**
 * Arbitrary for generation types that count toward file uploads
 */
const arbitraryFileUploadType = (): fc.Arbitrary<GenerationType> =>
  fc.constant('file-upload' as GenerationType);

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
 * Arbitrary for usage count within free tier limit
 */
const arbitraryUsageWithinLimit = (limit: number): fc.Arbitrary<number> =>
  fc.integer({ min: 0, max: limit - 1 });

/**
 * Arbitrary for usage count at or exceeding free tier limit
 */
const arbitraryUsageAtOrExceedingLimit = (limit: number): fc.Arbitrary<number> =>
  fc.integer({ min: limit, max: limit * 10 });

describe('Free Tier Limit Enforcement Property Tests', () => {
  /**
   * **Feature: freemium-platform-pivot, Property 4: Free Tier Limit Enforcement**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   *
   * *For any* Free tier user and any generation type with limit L, the (L+1)th generation
   * attempt within a calendar month SHALL be rejected with a 402 status code, while all
   * attempts 1 through L SHALL succeed (assuming no other failures).
   */

  test('Property 4: Free tier lesson plan generations within limit (1-5) are allowed', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanType(),
        arbitraryUsageWithinLimit(TIER_LIMITS.free.lessonPlans!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(5);
          expect(result.currentUsage).toBeLessThan(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier lesson plan generation at limit (5+) is rejected', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanType(),
        arbitraryUsageAtOrExceedingLimit(TIER_LIMITS.free.lessonPlans!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(false);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(5);
          expect(result.currentUsage).toBeGreaterThanOrEqual(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier activity generations within limit (1-10) are allowed', () => {
    fc.assert(
      fc.property(
        arbitraryActivityType(),
        arbitraryUsageWithinLimit(TIER_LIMITS.free.activities!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(10);
          expect(result.currentUsage).toBeLessThan(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier activity generation at limit (10+) is rejected', () => {
    fc.assert(
      fc.property(
        arbitraryActivityType(),
        arbitraryUsageAtOrExceedingLimit(TIER_LIMITS.free.activities!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(false);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(10);
          expect(result.currentUsage).toBeGreaterThanOrEqual(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier assessment generations within limit (1-3) are allowed', () => {
    fc.assert(
      fc.property(
        arbitraryAssessmentType(),
        arbitraryUsageWithinLimit(TIER_LIMITS.free.assessments!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(3);
          expect(result.currentUsage).toBeLessThan(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier assessment generation at limit (3+) is rejected', () => {
    fc.assert(
      fc.property(
        arbitraryAssessmentType(),
        arbitraryUsageAtOrExceedingLimit(TIER_LIMITS.free.assessments!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(false);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(3);
          expect(result.currentUsage).toBeGreaterThanOrEqual(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier file uploads within limit (1-2) are allowed', () => {
    fc.assert(
      fc.property(
        arbitraryFileUploadType(),
        arbitraryUsageWithinLimit(TIER_LIMITS.free.fileUploads!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(true);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(2);
          expect(result.currentUsage).toBeLessThan(result.limit!);
        }
      )
    );
  });

  test('Property 4: Free tier file upload at limit (2+) is rejected', () => {
    fc.assert(
      fc.property(
        arbitraryFileUploadType(),
        arbitraryUsageAtOrExceedingLimit(TIER_LIMITS.free.fileUploads!),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          expect(result.allowed).toBe(false);
          expect(result.tier).toBe('free');
          expect(result.limit).toBe(2);
          expect(result.currentUsage).toBeGreaterThanOrEqual(result.limit!);
        }
      )
    );
  });

  /**
   * Property 4 boundary test: exactly at limit should be rejected
   */
  test('Property 4: Free tier generation exactly at limit is rejected', () => {
    // Test each limit category at exactly the limit
    const testCases: Array<{ type: GenerationType; limit: number }> = [
      { type: 'lesson-plan', limit: 5 },
      { type: 'activity', limit: 10 },
      { type: 'assessment', limit: 3 },
      { type: 'file-upload', limit: 2 },
    ];

    for (const { type, limit } of testCases) {
      const result = checkLimitPure('free', type, limit);
      expect(result.allowed).toBe(false);
      expect(result.currentUsage).toBe(limit);
    }
  });

  /**
   * Property 4 boundary test: one below limit should be allowed
   */
  test('Property 4: Free tier generation one below limit is allowed', () => {
    const testCases: Array<{ type: GenerationType; limit: number }> = [
      { type: 'lesson-plan', limit: 5 },
      { type: 'activity', limit: 10 },
      { type: 'assessment', limit: 3 },
      { type: 'file-upload', limit: 2 },
    ];

    for (const { type, limit } of testCases) {
      const result = checkLimitPure('free', type, limit - 1);
      expect(result.allowed).toBe(true);
      expect(result.currentUsage).toBe(limit - 1);
    }
  });

  /**
   * Property 4: All activity types (worksheet, quiz, reading, slides) share the same limit
   */
  test('Property 4: All activity types share the same 10-generation limit', () => {
    const activityTypes: GenerationType[] = ['activity', 'worksheet', 'quiz', 'reading', 'slides'];

    fc.assert(
      fc.property(
        fc.constantFrom(...activityTypes) as fc.Arbitrary<GenerationType>,
        fc.integer({ min: 0, max: 100 }),
        (generationType, currentUsage) => {
          const result = checkLimitPure('free', generationType, currentUsage);

          // All activity types should have the same limit of 10
          expect(result.limit).toBe(10);

          // Allowed if under 10, rejected if 10 or more
          if (currentUsage < 10) {
            expect(result.allowed).toBe(true);
          } else {
            expect(result.allowed).toBe(false);
          }
        }
      )
    );
  });

  /**
   * Property 4: Generation type to category mapping is consistent
   */
  test('Property 4: Generation type to category mapping is deterministic', () => {
    fc.assert(
      fc.property(arbitraryGenerationType(), (generationType) => {
        const category1 = mapGenerationTypeToCategory(generationType);
        const category2 = mapGenerationTypeToCategory(generationType);

        // Same input should always produce same output
        expect(category1).toBe(category2);

        // Category should be one of the valid categories
        expect(['lessonPlans', 'activities', 'assessments', 'fileUploads']).toContain(category1);
      })
    );
  });
});
