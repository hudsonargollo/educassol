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
});
