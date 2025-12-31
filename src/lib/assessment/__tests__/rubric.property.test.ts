import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { validateRubric, type Rubric, type RubricQuestion } from '../rubric';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for valid rubric questions
 */
const arbitraryRubricQuestion = (): fc.Arbitrary<RubricQuestion> =>
  fc.record({
    number: fc.stringMatching(/^[1-9][0-9]{0,2}$/),
    topic: fc.string({ minLength: 1, maxLength: 100 }),
    max_points: fc.integer({ min: 1, max: 100 }),
    expected_answer: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    partial_credit_criteria: fc.option(fc.array(fc.string({ maxLength: 200 }), { maxLength: 5 }), { nil: undefined }),
    keywords: fc.option(fc.array(fc.string({ maxLength: 50 }), { maxLength: 10 }), { nil: undefined }),
  });

/**
 * Arbitrary for valid rubrics
 */
const arbitraryValidRubric = (): fc.Arbitrary<Rubric> =>
  fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }),
    total_points: fc.integer({ min: 1, max: 1000 }),
    questions: fc.array(arbitraryRubricQuestion(), { minLength: 1, maxLength: 50 }),
    grading_instructions: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
  });

/**
 * Arbitrary for invalid rubrics (missing required fields)
 */
const arbitraryInvalidRubric = (): fc.Arbitrary<unknown> =>
  fc.oneof(
    // Missing title
    fc.record({
      total_points: fc.integer({ min: 1, max: 1000 }),
      questions: fc.array(arbitraryRubricQuestion(), { minLength: 1, maxLength: 5 }),
    }),
    // Missing total_points
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }),
      questions: fc.array(arbitraryRubricQuestion(), { minLength: 1, maxLength: 5 }),
    }),
    // Missing questions
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }),
      total_points: fc.integer({ min: 1, max: 1000 }),
    }),
    // Empty questions array
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }),
      total_points: fc.integer({ min: 1, max: 1000 }),
      questions: fc.constant([]),
    }),
    // Empty title
    fc.record({
      title: fc.constant(''),
      total_points: fc.integer({ min: 1, max: 1000 }),
      questions: fc.array(arbitraryRubricQuestion(), { minLength: 1, maxLength: 5 }),
    }),
    // Invalid total_points (zero or negative)
    fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }),
      total_points: fc.integer({ min: -100, max: 0 }),
      questions: fc.array(arbitraryRubricQuestion(), { minLength: 1, maxLength: 5 }),
    }),
    // Null value
    fc.constant(null),
    // Undefined value
    fc.constant(undefined),
    // Non-object types
    fc.string(),
    fc.integer(),
    fc.boolean(),
  );

/**
 * Arbitrary for valid rubrics with consistent total_points
 * (total_points equals sum of all question max_points)
 */
const arbitraryConsistentRubric = (): fc.Arbitrary<Rubric> =>
  fc.array(arbitraryRubricQuestion(), { minLength: 1, maxLength: 20 }).chain((questions) => {
    const calculatedTotal = questions.reduce((sum, q) => sum + q.max_points, 0);
    return fc.record({
      title: fc.string({ minLength: 1, maxLength: 200 }),
      total_points: fc.constant(calculatedTotal),
      questions: fc.constant(questions),
      grading_instructions: fc.option(fc.string({ maxLength: 1000 }), { nil: undefined }),
    });
  });

/**
 * Helper function to calculate total points from questions
 */
function calculateTotalPoints(questions: RubricQuestion[]): number {
  return questions.reduce((sum, q) => sum + q.max_points, 0);
}

describe('Rubric Validation Property Tests', () => {
  /**
   * **Feature: automated-assessment, Property 2: Rubric validation correctness**
   * **Validates: Requirements 1.2**
   * 
   * *For any* rubric object, the validation function should accept rubrics containing
   * question definitions with point allocations, and reject rubrics missing these required elements.
   */
  test('Property 2: valid rubrics are accepted', () => {
    fc.assert(
      fc.property(arbitraryValidRubric(), (rubric) => {
        const result = validateRubric(rubric);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.title).toBe(rubric.title);
        expect(result.data?.total_points).toBe(rubric.total_points);
        expect(result.data?.questions.length).toBe(rubric.questions.length);
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 2: Rubric validation correctness**
   * **Validates: Requirements 1.2**
   * 
   * Invalid rubrics (missing required elements) should be rejected.
   */
  test('Property 2: invalid rubrics are rejected', () => {
    fc.assert(
      fc.property(arbitraryInvalidRubric(), (invalidRubric) => {
        const result = validateRubric(invalidRubric);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 2: Rubric validation correctness**
   * **Validates: Requirements 1.2**
   * 
   * Questions must have valid point allocations (positive integers).
   */
  test('Property 2: questions with invalid point allocations are rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          total_points: fc.integer({ min: 1, max: 1000 }),
          questions: fc.array(
            fc.record({
              number: fc.string({ minLength: 1, maxLength: 3 }),
              topic: fc.string({ minLength: 1, maxLength: 100 }),
              max_points: fc.integer({ min: -100, max: 0 }), // Invalid: non-positive
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        (rubricWithInvalidPoints) => {
          const result = validateRubric(rubricWithInvalidPoints);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 2: Rubric Total Points Invariant**
   * **Validates: Requirements 1.4**
   * 
   * *For any* valid rubric with one or more criteria, the total_points field SHALL 
   * equal the sum of all criteria max_points values.
   */
  test('Property 2: rubric total points equals sum of question max_points', () => {
    fc.assert(
      fc.property(arbitraryConsistentRubric(), (rubric) => {
        const result = validateRubric(rubric);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify total_points equals sum of all question max_points
        const calculatedTotal = calculateTotalPoints(rubric.questions);
        expect(result.data?.total_points).toBe(calculatedTotal);
      })
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 2: Rubric Total Points Invariant**
   * **Validates: Requirements 1.4**
   * 
   * Adding a question should increase total points by the question's max_points.
   */
  test('Property 2: adding a question increases total by question max_points', () => {
    fc.assert(
      fc.property(
        arbitraryConsistentRubric(),
        arbitraryRubricQuestion(),
        (rubric, newQuestion) => {
          const originalTotal = calculateTotalPoints(rubric.questions);
          const newQuestions = [...rubric.questions, newQuestion];
          const newTotal = calculateTotalPoints(newQuestions);
          
          // New total should equal original + new question's max_points
          expect(newTotal).toBe(originalTotal + newQuestion.max_points);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 2: Rubric Total Points Invariant**
   * **Validates: Requirements 1.4**
   * 
   * Removing a question should decrease total points by the question's max_points.
   */
  test('Property 2: removing a question decreases total by question max_points', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryRubricQuestion(), { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (questions, removeIndex) => {
          const safeIndex = removeIndex % questions.length;
          const originalTotal = calculateTotalPoints(questions);
          const removedQuestion = questions[safeIndex];
          const remainingQuestions = questions.filter((_, i) => i !== safeIndex);
          const newTotal = calculateTotalPoints(remainingQuestions);
          
          // New total should equal original - removed question's max_points
          expect(newTotal).toBe(originalTotal - removedQuestion.max_points);
        }
      )
    );
  });
});
