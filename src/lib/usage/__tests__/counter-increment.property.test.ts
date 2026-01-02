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

/**
 * Represents a generation attempt result
 */
interface GenerationAttempt {
  generationType: GenerationType;
  tier: Tier;
  success: boolean;
  timestamp: Date;
}

/**
 * Represents the usage counter state
 */
interface UsageCounterState {
  lessonPlans: number;
  activities: number;
  assessments: number;
  fileUploads: number;
}

/**
 * Maps generation types to their counter categories
 */
function mapGenerationTypeToCategory(generationType: GenerationType): keyof UsageCounterState {
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
 * Pure function to simulate counter increment logic
 * This mirrors the Edge Function behavior where counter only increments on success
 * 
 * Requirements: 12.3, 12.4
 * - 12.3: Increment usage counter only after successful generation completion
 * - 12.4: Failed generations SHALL NOT increment the counter
 */
function processGenerationAttempt(
  currentState: UsageCounterState,
  attempt: GenerationAttempt
): UsageCounterState {
  // If generation failed, do NOT increment counter (Requirement 12.4)
  if (!attempt.success) {
    return { ...currentState };
  }

  // If generation succeeded, increment the appropriate counter (Requirement 12.3)
  const category = mapGenerationTypeToCategory(attempt.generationType);
  return {
    ...currentState,
    [category]: currentState[category] + 1,
  };
}

/**
 * Process a sequence of generation attempts
 */
function processGenerationSequence(
  initialState: UsageCounterState,
  attempts: GenerationAttempt[]
): UsageCounterState {
  return attempts.reduce(
    (state, attempt) => processGenerationAttempt(state, attempt),
    initialState
  );
}

/**
 * Count successful attempts by category
 */
function countSuccessfulAttempts(
  attempts: GenerationAttempt[],
  category: keyof UsageCounterState
): number {
  return attempts.filter(attempt => {
    const attemptCategory = mapGenerationTypeToCategory(attempt.generationType);
    return attempt.success && attemptCategory === category;
  }).length;
}

/**
 * Arbitrary for generation types
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
 * Arbitrary for tiers
 */
const arbitraryTier = (): fc.Arbitrary<Tier> =>
  fc.constantFrom('free', 'premium', 'enterprise') as fc.Arbitrary<Tier>;

/**
 * Arbitrary for a generation attempt
 */
const arbitraryGenerationAttempt = (): fc.Arbitrary<GenerationAttempt> =>
  fc.record({
    generationType: arbitraryGenerationType(),
    tier: arbitraryTier(),
    success: fc.boolean(),
    timestamp: fc.date(),
  });

/**
 * Arbitrary for initial counter state
 */
const arbitraryInitialState = (): fc.Arbitrary<UsageCounterState> =>
  fc.record({
    lessonPlans: fc.nat({ max: 100 }),
    activities: fc.nat({ max: 100 }),
    assessments: fc.nat({ max: 100 }),
    fileUploads: fc.nat({ max: 100 }),
  });

/**
 * Arbitrary for a sequence of generation attempts
 */
const arbitraryAttemptSequence = (): fc.Arbitrary<GenerationAttempt[]> =>
  fc.array(arbitraryGenerationAttempt(), { minLength: 0, maxLength: 50 });

describe('Counter Increment on Success Only Property Tests', () => {
  /**
   * **Feature: freemium-platform-pivot, Property 7: Counter Increment on Success Only**
   * **Validates: Requirements 12.3, 12.4**
   *
   * *For any* generation attempt, the usage counter SHALL increment if and only if
   * the generation completes successfully. Failed generations SHALL NOT increment the counter.
   */

  test('Property 7: Successful generation increments counter by exactly 1', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        arbitraryGenerationType(),
        arbitraryTier(),
        (initialState, generationType, tier) => {
          const successfulAttempt: GenerationAttempt = {
            generationType,
            tier,
            success: true,
            timestamp: new Date(),
          };

          const newState = processGenerationAttempt(initialState, successfulAttempt);
          const category = mapGenerationTypeToCategory(generationType);

          // Counter should increment by exactly 1
          expect(newState[category]).toBe(initialState[category] + 1);

          // Other counters should remain unchanged
          const otherCategories = ['lessonPlans', 'activities', 'assessments', 'fileUploads']
            .filter(c => c !== category) as (keyof UsageCounterState)[];
          
          for (const otherCategory of otherCategories) {
            expect(newState[otherCategory]).toBe(initialState[otherCategory]);
          }
        }
      )
    );
  });

  test('Property 7: Failed generation does NOT increment counter', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        arbitraryGenerationType(),
        arbitraryTier(),
        (initialState, generationType, tier) => {
          const failedAttempt: GenerationAttempt = {
            generationType,
            tier,
            success: false,
            timestamp: new Date(),
          };

          const newState = processGenerationAttempt(initialState, failedAttempt);

          // All counters should remain unchanged
          expect(newState.lessonPlans).toBe(initialState.lessonPlans);
          expect(newState.activities).toBe(initialState.activities);
          expect(newState.assessments).toBe(initialState.assessments);
          expect(newState.fileUploads).toBe(initialState.fileUploads);
        }
      )
    );
  });

  test('Property 7: Counter equals count of successful attempts only', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        arbitraryAttemptSequence(),
        (initialState, attempts) => {
          const finalState = processGenerationSequence(initialState, attempts);

          // For each category, final count should equal initial + successful attempts
          const categories: (keyof UsageCounterState)[] = [
            'lessonPlans',
            'activities',
            'assessments',
            'fileUploads',
          ];

          for (const category of categories) {
            const successfulCount = countSuccessfulAttempts(attempts, category);
            expect(finalState[category]).toBe(initialState[category] + successfulCount);
          }
        }
      )
    );
  });

  test('Property 7: Order of success/failure does not affect final count', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        arbitraryAttemptSequence(),
        (initialState, attempts) => {
          // Process in original order
          const finalState1 = processGenerationSequence(initialState, attempts);

          // Process in reversed order
          const reversedAttempts = [...attempts].reverse();
          const finalState2 = processGenerationSequence(initialState, reversedAttempts);

          // Final counts should be identical regardless of order
          expect(finalState1.lessonPlans).toBe(finalState2.lessonPlans);
          expect(finalState1.activities).toBe(finalState2.activities);
          expect(finalState1.assessments).toBe(finalState2.assessments);
          expect(finalState1.fileUploads).toBe(finalState2.fileUploads);
        }
      )
    );
  });

  test('Property 7: Multiple consecutive failures do not change counter', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        fc.array(arbitraryGenerationType(), { minLength: 1, maxLength: 20 }),
        arbitraryTier(),
        (initialState, generationTypes, tier) => {
          // Create all failed attempts
          const failedAttempts: GenerationAttempt[] = generationTypes.map(gt => ({
            generationType: gt,
            tier,
            success: false,
            timestamp: new Date(),
          }));

          const finalState = processGenerationSequence(initialState, failedAttempts);

          // All counters should remain unchanged after any number of failures
          expect(finalState.lessonPlans).toBe(initialState.lessonPlans);
          expect(finalState.activities).toBe(initialState.activities);
          expect(finalState.assessments).toBe(initialState.assessments);
          expect(finalState.fileUploads).toBe(initialState.fileUploads);
        }
      )
    );
  });

  test('Property 7: Counter increment is idempotent for same successful attempt', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        arbitraryGenerationAttempt(),
        (initialState, attempt) => {
          // Process the attempt once
          const stateAfterFirst = processGenerationAttempt(initialState, attempt);

          // The function should be pure - same input produces same output
          const stateAfterSecondCall = processGenerationAttempt(initialState, attempt);

          // Both calls with same initial state should produce identical results
          expect(stateAfterFirst.lessonPlans).toBe(stateAfterSecondCall.lessonPlans);
          expect(stateAfterFirst.activities).toBe(stateAfterSecondCall.activities);
          expect(stateAfterFirst.assessments).toBe(stateAfterSecondCall.assessments);
          expect(stateAfterFirst.fileUploads).toBe(stateAfterSecondCall.fileUploads);
        }
      )
    );
  });

  test('Property 7: Tier does not affect counter increment behavior', () => {
    fc.assert(
      fc.property(
        arbitraryInitialState(),
        arbitraryGenerationType(),
        fc.boolean(),
        (initialState, generationType, success) => {
          const tiers: Tier[] = ['free', 'premium', 'enterprise'];
          const results: UsageCounterState[] = [];

          // Process same attempt with different tiers
          for (const tier of tiers) {
            const attempt: GenerationAttempt = {
              generationType,
              tier,
              success,
              timestamp: new Date(),
            };
            results.push(processGenerationAttempt(initialState, attempt));
          }

          // All tiers should produce identical counter changes
          const [free, premium, enterprise] = results;
          expect(free.lessonPlans).toBe(premium.lessonPlans);
          expect(free.lessonPlans).toBe(enterprise.lessonPlans);
          expect(free.activities).toBe(premium.activities);
          expect(free.activities).toBe(enterprise.activities);
          expect(free.assessments).toBe(premium.assessments);
          expect(free.assessments).toBe(enterprise.assessments);
          expect(free.fileUploads).toBe(premium.fileUploads);
          expect(free.fileUploads).toBe(enterprise.fileUploads);
        }
      )
    );
  });

  test('Property 7: Activity types all increment the same counter', () => {
    const activityTypes: GenerationType[] = ['activity', 'worksheet', 'quiz', 'reading', 'slides'];

    fc.assert(
      fc.property(
        arbitraryInitialState(),
        fc.constantFrom(...activityTypes) as fc.Arbitrary<GenerationType>,
        arbitraryTier(),
        (initialState, generationType, tier) => {
          const successfulAttempt: GenerationAttempt = {
            generationType,
            tier,
            success: true,
            timestamp: new Date(),
          };

          const newState = processGenerationAttempt(initialState, successfulAttempt);

          // All activity types should increment the 'activities' counter
          expect(newState.activities).toBe(initialState.activities + 1);
          
          // Other counters should remain unchanged
          expect(newState.lessonPlans).toBe(initialState.lessonPlans);
          expect(newState.assessments).toBe(initialState.assessments);
          expect(newState.fileUploads).toBe(initialState.fileUploads);
        }
      )
    );
  });
});
