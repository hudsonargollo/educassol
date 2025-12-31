import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  createOverride,
  calculateFinalScore,
  hasOverride,
  getOverride,
  getEffectiveScore,
} from '../override';
import type { GradingResult, QuestionResult, QuestionOverride } from '../grading-result';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for valid override input
 */
const arbitraryValidOverrideInput = () =>
  fc.record({
    questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
    originalScore: fc.float({ min: 0, max: 100, noNaN: true }),
    maxPoints: fc.float({ min: 1, max: 100, noNaN: true }),
  }).chain(({ questionNumber, originalScore, maxPoints }) =>
    fc.record({
      questionNumber: fc.constant(questionNumber),
      originalScore: fc.constant(Math.min(originalScore, maxPoints)),
      overrideScore: fc.float({ min: 0, max: maxPoints, noNaN: true }),
      maxPoints: fc.constant(maxPoints),
      overrideReason: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    })
  );

/**
 * Arbitrary for question result
 */
const arbitraryQuestionResult = (): fc.Arbitrary<QuestionResult> =>
  fc.record({
    number: fc.string({ minLength: 1, maxLength: 10 }),
    topic: fc.string({ minLength: 1, maxLength: 100 }),
    student_response_transcription: fc.string({ maxLength: 500 }),
    is_correct: fc.boolean(),
    max_points: fc.float({ min: 1, max: 100, noNaN: true }),
  }).chain(({ number, topic, student_response_transcription, is_correct, max_points }) =>
    fc.record({
      number: fc.constant(number),
      topic: fc.constant(topic),
      student_response_transcription: fc.constant(student_response_transcription),
      is_correct: fc.constant(is_correct),
      points_awarded: fc.float({ min: 0, max: max_points, noNaN: true }),
      max_points: fc.constant(max_points),
      reasoning: fc.string({ maxLength: 500 }),
      feedback_for_student: fc.string({ maxLength: 500 }),
    })
  );

/**
 * Arbitrary for grading result without overrides
 */
const arbitraryGradingResultBase = (): fc.Arbitrary<GradingResult> =>
  fc.record({
    student_metadata: fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }),
      student_id: fc.string({ minLength: 1, maxLength: 50 }),
      handwriting_quality: fc.constantFrom('excellent', 'good', 'poor', 'illegible'),
    }),
    questions: fc.array(arbitraryQuestionResult(), { minLength: 1, maxLength: 10 }),
    summary_comment: fc.string({ maxLength: 500 }),
    total_score: fc.float({ min: 0, max: 1000, noNaN: true }),
  });

describe('Override Property Tests', () => {
  /**
   * **Feature: magic-grading-engine, Property 7: Override Bounds and Preservation**
   * **Validates: Requirements 5.1, 5.2, 5.5**
   * 
   * *For any* score override, the override value SHALL be between 0 and the criterion's 
   * max_points inclusive, and both the original AI score and override value SHALL be preserved.
   */
  test('Property 7: valid overrides within bounds are accepted and preserve both scores', () => {
    fc.assert(
      fc.property(arbitraryValidOverrideInput(), (input) => {
        const result = createOverride(input);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify override score is within bounds
        expect(result.data!.overrideScore).toBeGreaterThanOrEqual(0);
        expect(result.data!.overrideScore).toBeLessThanOrEqual(input.maxPoints);
        
        // Verify both original and override scores are preserved
        expect(result.data!.originalScore).toBe(input.originalScore);
        expect(result.data!.overrideScore).toBe(input.overrideScore);
        expect(result.data!.questionNumber).toBe(input.questionNumber);
        
        // Verify timestamp is set
        expect(result.data!.overriddenAt).toBeInstanceOf(Date);
      })
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 7: Override Bounds and Preservation**
   * **Validates: Requirements 5.1, 5.2, 5.5**
   * 
   * Overrides with score exceeding max_points should be rejected.
   */
  test('Property 7: overrides exceeding max_points are rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
          originalScore: fc.integer({ min: 0, max: 50 }),
          maxPoints: fc.integer({ min: 1, max: 50 }),
        }).chain(({ questionNumber, originalScore, maxPoints }) =>
          fc.record({
            questionNumber: fc.constant(questionNumber),
            originalScore: fc.constant(Math.min(originalScore, maxPoints)),
            overrideScore: fc.integer({ min: maxPoints + 1, max: maxPoints + 100 }),
            maxPoints: fc.constant(maxPoints),
          })
        ),
        (input) => {
          const result = createOverride(input);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 7: Override Bounds and Preservation**
   * **Validates: Requirements 5.1, 5.2, 5.5**
   * 
   * Overrides with negative score should be rejected.
   */
  test('Property 7: overrides with negative score are rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
          originalScore: fc.integer({ min: 0, max: 50 }),
          overrideScore: fc.integer({ min: -100, max: -1 }),
          maxPoints: fc.integer({ min: 1, max: 100 }),
        }),
        (input) => {
          const result = createOverride(input);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 8: Final Score Calculation with Overrides**
   * **Validates: Requirements 5.3**
   * 
   * *For any* grading result with overrides, the final total score SHALL equal the sum of:
   * override values for overridden questions, plus AI scores for non-overridden questions.
   */
  test('Property 8: final score uses overrides where present, AI scores otherwise', () => {
    fc.assert(
      fc.property(
        arbitraryGradingResultBase().chain((baseResult) => {
          // Generate overrides for some questions
          const questionNumbers = baseResult.questions.map(q => q.number);
          return fc.record({
            baseResult: fc.constant(baseResult),
            overrideIndices: fc.array(
              fc.integer({ min: 0, max: questionNumbers.length - 1 }),
              { minLength: 0, maxLength: questionNumbers.length }
            ).map(indices => [...new Set(indices)]), // Remove duplicates
          });
        }),
        ({ baseResult, overrideIndices }) => {
          // Create overrides for selected questions
          const overrides: QuestionOverride[] = overrideIndices.map(idx => {
            const question = baseResult.questions[idx];
            return {
              questionNumber: question.number,
              originalScore: question.points_awarded,
              overrideScore: Math.random() * question.max_points, // Random valid override
              overriddenAt: new Date(),
            };
          });

          const gradingResult: GradingResult = {
            ...baseResult,
            overrides,
          };

          const finalScore = calculateFinalScore(gradingResult);

          // Calculate expected score manually
          const overrideMap = new Map(overrides.map(o => [o.questionNumber, o.overrideScore]));
          let expectedScore = 0;
          for (const question of baseResult.questions) {
            const overrideScore = overrideMap.get(question.number);
            expectedScore += overrideScore !== undefined ? overrideScore : question.points_awarded;
          }

          expect(finalScore).toBeCloseTo(expectedScore, 5);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 8: Final Score Calculation with Overrides**
   * **Validates: Requirements 5.3**
   * 
   * When no overrides exist, final score equals sum of AI scores.
   */
  test('Property 8: final score equals AI score sum when no overrides', () => {
    fc.assert(
      fc.property(arbitraryGradingResultBase(), (gradingResult) => {
        // Ensure no overrides
        const resultWithoutOverrides: GradingResult = {
          ...gradingResult,
          overrides: undefined,
        };

        const finalScore = calculateFinalScore(resultWithoutOverrides);
        const expectedScore = gradingResult.questions.reduce(
          (sum, q) => sum + q.points_awarded,
          0
        );

        expect(finalScore).toBeCloseTo(expectedScore, 5);
      })
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 8: Final Score Calculation with Overrides**
   * **Validates: Requirements 5.3**
   * 
   * hasOverride correctly identifies overridden questions.
   */
  test('Property 8: hasOverride correctly identifies overridden questions', () => {
    fc.assert(
      fc.property(
        arbitraryGradingResultBase().chain((baseResult) => {
          const questionNumbers = baseResult.questions.map(q => q.number);
          return fc.record({
            baseResult: fc.constant(baseResult),
            overrideIndex: fc.integer({ min: 0, max: questionNumbers.length - 1 }),
          });
        }),
        ({ baseResult, overrideIndex }) => {
          const overriddenQuestion = baseResult.questions[overrideIndex];
          const override: QuestionOverride = {
            questionNumber: overriddenQuestion.number,
            originalScore: overriddenQuestion.points_awarded,
            overrideScore: overriddenQuestion.max_points / 2,
            overriddenAt: new Date(),
          };

          const gradingResult: GradingResult = {
            ...baseResult,
            overrides: [override],
          };

          // Overridden question should return true
          expect(hasOverride(gradingResult, overriddenQuestion.number)).toBe(true);

          // Non-overridden questions should return false
          for (const question of baseResult.questions) {
            if (question.number !== overriddenQuestion.number) {
              expect(hasOverride(gradingResult, question.number)).toBe(false);
            }
          }
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 8: Final Score Calculation with Overrides**
   * **Validates: Requirements 5.3**
   * 
   * getEffectiveScore returns override when present, AI score otherwise.
   */
  test('Property 8: getEffectiveScore returns correct score based on override presence', () => {
    fc.assert(
      fc.property(
        arbitraryGradingResultBase().chain((baseResult) => {
          const questionNumbers = baseResult.questions.map(q => q.number);
          return fc.record({
            baseResult: fc.constant(baseResult),
            overrideIndex: fc.integer({ min: 0, max: questionNumbers.length - 1 }),
            overrideScore: fc.float({ min: 0, max: 100, noNaN: true }),
          });
        }),
        ({ baseResult, overrideIndex, overrideScore }) => {
          const overriddenQuestion = baseResult.questions[overrideIndex];
          const clampedOverrideScore = Math.min(overrideScore, overriddenQuestion.max_points);
          
          const override: QuestionOverride = {
            questionNumber: overriddenQuestion.number,
            originalScore: overriddenQuestion.points_awarded,
            overrideScore: clampedOverrideScore,
            overriddenAt: new Date(),
          };

          const gradingResult: GradingResult = {
            ...baseResult,
            overrides: [override],
          };

          // Overridden question should return override score
          expect(getEffectiveScore(gradingResult, overriddenQuestion.number)).toBe(clampedOverrideScore);

          // Non-overridden questions should return AI score
          for (const question of baseResult.questions) {
            if (question.number !== overriddenQuestion.number) {
              expect(getEffectiveScore(gradingResult, question.number)).toBe(question.points_awarded);
            }
          }
        }
      )
    );
  });
});
