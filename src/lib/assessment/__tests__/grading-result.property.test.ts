import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  parseGradingResult,
  serializeGradingResult,
  deserializeGradingResult,
  type GradingResult,
  type QuestionResult,
  type StudentMetadata,
  type HandwritingQuality,
} from '../grading-result';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for handwriting quality
 */
const arbitraryHandwritingQuality = (): fc.Arbitrary<HandwritingQuality> =>
  fc.constantFrom('excellent', 'good', 'poor', 'illegible');

/**
 * Arbitrary for student metadata
 */
const arbitraryStudentMetadata = (): fc.Arbitrary<StudentMetadata> =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    student_id: fc.string({ minLength: 1, maxLength: 50 }),
    handwriting_quality: arbitraryHandwritingQuality(),
  });

/**
 * Arbitrary for question result
 */
const arbitraryQuestionResult = (): fc.Arbitrary<QuestionResult> =>
  fc.record({
    number: fc.string({ minLength: 1, maxLength: 10 }),
    topic: fc.string({ minLength: 1, maxLength: 100 }),
    student_response_transcription: fc.string({ maxLength: 500 }),
    is_correct: fc.boolean(),
    points_awarded: fc.float({ min: 0, max: 100, noNaN: true }),
    max_points: fc.float({ min: 0, max: 100, noNaN: true }),
    reasoning: fc.string({ maxLength: 500 }),
    feedback_for_student: fc.string({ maxLength: 500 }),
  });

/**
 * Arbitrary for valid grading results
 */
const arbitraryGradingResult = (): fc.Arbitrary<GradingResult> =>
  fc.record({
    student_metadata: arbitraryStudentMetadata(),
    questions: fc.array(arbitraryQuestionResult(), { minLength: 1, maxLength: 20 }),
    summary_comment: fc.string({ maxLength: 500 }),
    total_score: fc.float({ min: 0, max: 1000, noNaN: true }),
  });

describe('Grading Result Property Tests', () => {
  /**
   * **Feature: automated-assessment, Property 9: Grading result schema validation**
   * **Validates: Requirements 4.1, 4.2, 4.3**
   * 
   * *For any* grading result object, it must contain student_metadata (with name, student_id, 
   * handwriting_quality), a questions array (each with number, topic, student_response_transcription, 
   * is_correct, points_awarded, max_points, reasoning, feedback_for_student), summary_comment, and total_score.
   */
  test('Property 9: valid grading results are accepted', () => {
    fc.assert(
      fc.property(arbitraryGradingResult(), (gradingResult) => {
        const result = parseGradingResult(gradingResult);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify student_metadata fields
        expect(result.data?.student_metadata.name).toBe(gradingResult.student_metadata.name);
        expect(result.data?.student_metadata.student_id).toBe(gradingResult.student_metadata.student_id);
        expect(result.data?.student_metadata.handwriting_quality).toBe(gradingResult.student_metadata.handwriting_quality);
        
        // Verify questions array
        expect(result.data?.questions.length).toBe(gradingResult.questions.length);
        
        // Verify summary and score
        expect(result.data?.summary_comment).toBe(gradingResult.summary_comment);
        expect(result.data?.total_score).toBe(gradingResult.total_score);
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 9: Grading result schema validation**
   * **Validates: Requirements 4.1, 4.2, 4.3**
   * 
   * Invalid grading results (missing required fields) should be rejected.
   */
  test('Property 9: invalid grading results are rejected', () => {
    const arbitraryInvalidGradingResult = fc.oneof(
      // Missing student_metadata
      fc.record({
        questions: fc.array(arbitraryQuestionResult(), { minLength: 1, maxLength: 5 }),
        summary_comment: fc.string({ maxLength: 500 }),
        total_score: fc.float({ min: 0, max: 1000, noNaN: true }),
      }),
      // Missing questions
      fc.record({
        student_metadata: arbitraryStudentMetadata(),
        summary_comment: fc.string({ maxLength: 500 }),
        total_score: fc.float({ min: 0, max: 1000, noNaN: true }),
      }),
      // Empty questions array
      fc.record({
        student_metadata: arbitraryStudentMetadata(),
        questions: fc.constant([]),
        summary_comment: fc.string({ maxLength: 500 }),
        total_score: fc.float({ min: 0, max: 1000, noNaN: true }),
      }),
      // Null/undefined
      fc.constant(null),
      fc.constant(undefined),
    );

    fc.assert(
      fc.property(arbitraryInvalidGradingResult, (invalidResult) => {
        const result = parseGradingResult(invalidResult);
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 10: Grading result serialization round-trip**
   * **Validates: Requirements 4.4, 4.5**
   * 
   * *For any* valid GradingResult object, serializing to JSON and deserializing back 
   * should produce an equivalent object with all fields preserved.
   */
  test('Property 10: serialization round-trip preserves data', () => {
    fc.assert(
      fc.property(arbitraryGradingResult(), (gradingResult) => {
        // Serialize to JSON
        const json = serializeGradingResult(gradingResult);
        
        // Deserialize back
        const result = deserializeGradingResult(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify all fields are preserved
        expect(result.data?.student_metadata.name).toBe(gradingResult.student_metadata.name);
        expect(result.data?.student_metadata.student_id).toBe(gradingResult.student_metadata.student_id);
        expect(result.data?.student_metadata.handwriting_quality).toBe(gradingResult.student_metadata.handwriting_quality);
        expect(result.data?.questions.length).toBe(gradingResult.questions.length);
        expect(result.data?.summary_comment).toBe(gradingResult.summary_comment);
        expect(result.data?.total_score).toBe(gradingResult.total_score);
        
        // Verify each question is preserved
        for (let i = 0; i < gradingResult.questions.length; i++) {
          expect(result.data?.questions[i].number).toBe(gradingResult.questions[i].number);
          expect(result.data?.questions[i].topic).toBe(gradingResult.questions[i].topic);
          expect(result.data?.questions[i].is_correct).toBe(gradingResult.questions[i].is_correct);
          expect(result.data?.questions[i].points_awarded).toBe(gradingResult.questions[i].points_awarded);
          expect(result.data?.questions[i].max_points).toBe(gradingResult.questions[i].max_points);
        }
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 10: Grading result serialization round-trip**
   * **Validates: Requirements 4.4, 4.5**
   * 
   * Invalid JSON strings should be rejected during deserialization.
   */
  test('Property 10: invalid JSON strings are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => {
          try {
            JSON.parse(s);
            return false; // Valid JSON, skip
          } catch {
            return true; // Invalid JSON, keep
          }
        }),
        (invalidJson) => {
          const result = deserializeGradingResult(invalidJson);
          expect(result.success).toBe(false);
        }
      )
    );
  });
});
