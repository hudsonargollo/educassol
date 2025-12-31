import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateLessonPlan,
  serializeLessonPlan,
  deserializeLessonPlan,
  type LessonPlan,
  type KeyVocabulary,
  type LessonPhase,
  type FormativeAssessment,
  type PhaseType,
  type FormativeAssessmentType,
  type LessonStatus,
} from '../lesson-plan';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for valid dates (avoiding NaN dates)
 * Uses integer timestamps to ensure valid dates
 */
const arbitraryValidDate = (): fc.Arbitrary<Date> =>
  fc.integer({ 
    min: new Date('2020-01-01').getTime(), 
    max: new Date('2030-12-31').getTime() 
  }).map(timestamp => new Date(timestamp));

/**
 * Arbitrary for phase types (5E Instructional Model)
 */
const arbitraryPhaseType = (): fc.Arbitrary<PhaseType> =>
  fc.constantFrom('hook', 'direct-instruction', 'guided-practice', 'independent-practice', 'closure');

/**
 * Arbitrary for formative assessment types
 */
const arbitraryFormativeAssessmentType = (): fc.Arbitrary<FormativeAssessmentType> =>
  fc.constantFrom('exit-ticket', 'quick-check', 'observation');

/**
 * Arbitrary for lesson status
 */
const arbitraryLessonStatus = (): fc.Arbitrary<LessonStatus> =>
  fc.constantFrom('draft', 'planned', 'in-progress', 'completed');

/**
 * Arbitrary for non-empty strings (avoiding whitespace-only strings)
 * Uses alphanumeric characters to ensure valid non-empty strings
 */
const arbitraryNonEmptyString = (maxLength: number = 100): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.trim() || 'a') // Ensure non-empty after trim
    .filter(s => s.length > 0);

/**
 * Arbitrary for key vocabulary items
 */
const arbitraryKeyVocabulary = (): fc.Arbitrary<KeyVocabulary> =>
  fc.record({
    term: arbitraryNonEmptyString(50),
    definition: arbitraryNonEmptyString(200),
  });

/**
 * Arbitrary for lesson phases
 */
const arbitraryLessonPhase = (): fc.Arbitrary<LessonPhase> =>
  fc.record({
    type: arbitraryPhaseType(),
    name: arbitraryNonEmptyString(100),
    duration: fc.integer({ min: 1, max: 120 }),
    teacherScript: arbitraryNonEmptyString(500),
    studentAction: arbitraryNonEmptyString(500),
    differentiationNotes: fc.option(
      fc.record({
        support: fc.string({ maxLength: 200 }),
        extension: fc.string({ maxLength: 200 }),
      }),
      { nil: undefined }
    ),
  });

/**
 * Arbitrary for formative assessment
 */
const arbitraryFormativeAssessment = (): fc.Arbitrary<FormativeAssessment> =>
  fc.record({
    type: arbitraryFormativeAssessmentType(),
    question: arbitraryNonEmptyString(300),
  });

/**
 * Arbitrary for valid lesson plans
 */
const arbitraryLessonPlan = (): fc.Arbitrary<LessonPlan> =>
  fc.record({
    id: fc.uuid(),
    unitId: fc.option(fc.uuid(), { nil: undefined }),
    date: arbitraryValidDate(),
    topic: arbitraryNonEmptyString(100),
    gradeLevel: arbitraryNonEmptyString(20),
    subject: arbitraryNonEmptyString(50),
    duration: fc.integer({ min: 1, max: 180 }),
    standards: fc.array(arbitraryNonEmptyString(50), { minLength: 1, maxLength: 5 }),
    learningObjective: arbitraryNonEmptyString(300),
    keyVocabulary: fc.array(arbitraryKeyVocabulary(), { minLength: 1, maxLength: 10 }),
    materialsNeeded: fc.array(arbitraryNonEmptyString(100), { maxLength: 10 }),
    phases: fc.array(arbitraryLessonPhase(), { minLength: 1, maxLength: 5 }),
    formativeAssessment: arbitraryFormativeAssessment(),
    status: arbitraryLessonStatus(),
    createdAt: arbitraryValidDate(),
    updatedAt: arbitraryValidDate(),
    createdBy: arbitraryNonEmptyString(50),
  });

describe('Lesson Plan Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 6: Lesson Plan Schema Round-Trip**
   * **Validates: Requirements 3.7**
   * 
   * *For any* valid LessonPlan object, serializing to JSON then deserializing 
   * SHALL produce an equivalent LessonPlan object.
   */
  test('Property 6: serialization round-trip preserves data', () => {
    fc.assert(
      fc.property(arbitraryLessonPlan(), (lessonPlan) => {
        // Serialize to JSON
        const json = serializeLessonPlan(lessonPlan);
        
        // Deserialize back
        const result = deserializeLessonPlan(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify core fields are preserved
        expect(result.data?.id).toBe(lessonPlan.id);
        expect(result.data?.unitId).toBe(lessonPlan.unitId);
        expect(result.data?.topic).toBe(lessonPlan.topic);
        expect(result.data?.gradeLevel).toBe(lessonPlan.gradeLevel);
        expect(result.data?.subject).toBe(lessonPlan.subject);
        expect(result.data?.duration).toBe(lessonPlan.duration);
        expect(result.data?.learningObjective).toBe(lessonPlan.learningObjective);
        expect(result.data?.status).toBe(lessonPlan.status);
        expect(result.data?.createdBy).toBe(lessonPlan.createdBy);
        
        // Verify arrays are preserved
        expect(result.data?.standards).toEqual(lessonPlan.standards);
        expect(result.data?.materialsNeeded).toEqual(lessonPlan.materialsNeeded);
        expect(result.data?.keyVocabulary.length).toBe(lessonPlan.keyVocabulary.length);
        expect(result.data?.phases.length).toBe(lessonPlan.phases.length);
        
        // Verify key vocabulary items
        for (let i = 0; i < lessonPlan.keyVocabulary.length; i++) {
          expect(result.data?.keyVocabulary[i].term).toBe(lessonPlan.keyVocabulary[i].term);
          expect(result.data?.keyVocabulary[i].definition).toBe(lessonPlan.keyVocabulary[i].definition);
        }
        
        // Verify phases
        for (let i = 0; i < lessonPlan.phases.length; i++) {
          expect(result.data?.phases[i].type).toBe(lessonPlan.phases[i].type);
          expect(result.data?.phases[i].name).toBe(lessonPlan.phases[i].name);
          expect(result.data?.phases[i].duration).toBe(lessonPlan.phases[i].duration);
          expect(result.data?.phases[i].teacherScript).toBe(lessonPlan.phases[i].teacherScript);
          expect(result.data?.phases[i].studentAction).toBe(lessonPlan.phases[i].studentAction);
        }
        
        // Verify formative assessment
        expect(result.data?.formativeAssessment.type).toBe(lessonPlan.formativeAssessment.type);
        expect(result.data?.formativeAssessment.question).toBe(lessonPlan.formativeAssessment.question);
        
        // Verify dates (compare timestamps since Date objects are serialized as strings)
        expect(result.data?.date.getTime()).toBe(lessonPlan.date.getTime());
        expect(result.data?.createdAt.getTime()).toBe(lessonPlan.createdAt.getTime());
        expect(result.data?.updatedAt.getTime()).toBe(lessonPlan.updatedAt.getTime());
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 6: Lesson Plan Schema Round-Trip**
   * **Validates: Requirements 3.7**
   * 
   * Valid lesson plans should pass validation.
   */
  test('Property 6: valid lesson plans are accepted', () => {
    fc.assert(
      fc.property(arbitraryLessonPlan(), (lessonPlan) => {
        const result = validateLessonPlan(lessonPlan);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 6: Lesson Plan Schema Round-Trip**
   * **Validates: Requirements 3.7**
   * 
   * Invalid JSON strings should be rejected during deserialization.
   */
  test('Property 6: invalid JSON strings are rejected', () => {
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
          const result = deserializeLessonPlan(invalidJson);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 7: Lesson Plan Structure Completeness**
   * **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
   * 
   * *For any* generated lesson plan, it SHALL have a non-empty learningObjective, 
   * at least one phase with duration/teacherScript/studentAction, at least one 
   * keyVocabulary entry with term/definition, and a formativeAssessment with type/question.
   */
  test('Property 7: lesson plan structure completeness', () => {
    fc.assert(
      fc.property(arbitraryLessonPlan(), (lessonPlan) => {
        const result = validateLessonPlan(lessonPlan);
        expect(result.success).toBe(true);
        
        // Verify non-empty learning objective (Requirement 3.3)
        expect(result.data?.learningObjective.length).toBeGreaterThan(0);
        
        // Verify at least one phase with required fields (Requirement 3.4)
        expect(result.data?.phases.length).toBeGreaterThan(0);
        result.data?.phases.forEach(phase => {
          expect(phase.duration).toBeGreaterThan(0);
          expect(phase.teacherScript.length).toBeGreaterThan(0);
          expect(phase.studentAction.length).toBeGreaterThan(0);
        });
        
        // Verify at least one vocabulary item (Requirement 3.5)
        expect(result.data?.keyVocabulary.length).toBeGreaterThan(0);
        result.data?.keyVocabulary.forEach(vocab => {
          expect(vocab.term.length).toBeGreaterThan(0);
          expect(vocab.definition.length).toBeGreaterThan(0);
        });
        
        // Verify formative assessment (Requirement 3.6)
        expect(result.data?.formativeAssessment.type).toBeDefined();
        expect(result.data?.formativeAssessment.question.length).toBeGreaterThan(0);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 8: Lesson Plan Phase Model Compliance**
   * **Validates: Requirements 3.2**
   * 
   * *For any* generated lesson plan, the phases array SHALL contain phases that map 
   * to the 5E model types ('hook', 'direct-instruction', 'guided-practice', 
   * 'independent-practice', 'closure').
   */
  test('Property 8: lesson plan phases follow 5E model', () => {
    const validPhaseTypes = ['hook', 'direct-instruction', 'guided-practice', 'independent-practice', 'closure'];
    
    fc.assert(
      fc.property(arbitraryLessonPlan(), (lessonPlan) => {
        const result = validateLessonPlan(lessonPlan);
        expect(result.success).toBe(true);
        
        // Verify all phases have valid 5E model types
        result.data?.phases.forEach(phase => {
          expect(validPhaseTypes).toContain(phase.type);
        });
      })
    );
  });
});
