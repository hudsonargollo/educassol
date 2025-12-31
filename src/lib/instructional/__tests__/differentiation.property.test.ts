import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Differentiation types
 */
type DifferentiationType = 'ell' | 'advanced' | 'adhd' | 'visual';

/**
 * Lesson plan phase
 */
interface LessonPhase {
  type: 'hook' | 'direct-instruction' | 'guided-practice' | 'independent-practice' | 'closure';
  name: string;
  duration: number;
  teacherScript: string;
  studentAction: string;
  differentiationNotes?: {
    support: string;
    extension: string;
  };
}

/**
 * Lesson plan for differentiation
 */
interface LessonPlan {
  id: string;
  topic: string;
  learningObjective: string;
  keyVocabulary: Array<{ term: string; definition: string }>;
  phases: LessonPhase[];
  formativeAssessment: {
    type: string;
    question: string;
  };
}

/**
 * Differentiated content result
 */
interface DifferentiatedContent {
  original: LessonPlan;
  modifications: DifferentiationType[];
  adapted: LessonPlan;
}

/**
 * Arbitrary for valid dates
 */
const arbitraryValidDate = (): fc.Arbitrary<Date> =>
  fc.integer({ 
    min: new Date('2020-01-01').getTime(), 
    max: new Date('2030-12-31').getTime() 
  }).map(timestamp => new Date(timestamp));

/**
 * Arbitrary for non-empty strings
 */
const arbitraryNonEmptyString = (maxLength: number = 100): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.trim() || 'a')
    .filter(s => s.length > 0);

/**
 * Arbitrary for differentiation types
 */
const arbitraryDifferentiationType = (): fc.Arbitrary<DifferentiationType> =>
  fc.constantFrom('ell', 'advanced', 'adhd', 'visual');

/**
 * Arbitrary for phase types
 */
const arbitraryPhaseType = (): fc.Arbitrary<LessonPhase['type']> =>
  fc.constantFrom('hook', 'direct-instruction', 'guided-practice', 'independent-practice', 'closure');

/**
 * Arbitrary for lesson phases
 */
const arbitraryLessonPhase = (): fc.Arbitrary<LessonPhase> =>
  fc.record({
    type: arbitraryPhaseType(),
    name: arbitraryNonEmptyString(50),
    duration: fc.integer({ min: 5, max: 30 }),
    teacherScript: arbitraryNonEmptyString(500),
    studentAction: arbitraryNonEmptyString(200),
    differentiationNotes: fc.option(
      fc.record({
        support: arbitraryNonEmptyString(200),
        extension: arbitraryNonEmptyString(200),
      }),
      { nil: undefined }
    ),
  });

/**
 * Arbitrary for vocabulary entries
 */
const arbitraryVocabularyEntry = (): fc.Arbitrary<{ term: string; definition: string }> =>
  fc.record({
    term: arbitraryNonEmptyString(50),
    definition: arbitraryNonEmptyString(200),
  });

/**
 * Arbitrary for lesson plans
 */
const arbitraryLessonPlan = (): fc.Arbitrary<LessonPlan> =>
  fc.record({
    id: fc.uuid(),
    topic: arbitraryNonEmptyString(100),
    learningObjective: arbitraryNonEmptyString(300),
    keyVocabulary: fc.array(arbitraryVocabularyEntry(), { minLength: 1, maxLength: 10 }),
    phases: fc.array(arbitraryLessonPhase(), { minLength: 1, maxLength: 5 }),
    formativeAssessment: fc.record({
      type: fc.constantFrom('exit-ticket', 'quick-check', 'observation'),
      question: arbitraryNonEmptyString(200),
    }),
  });

/**
 * Simulate differentiation - modifies content while preserving learning objective
 */
function differentiate(
  lessonPlan: LessonPlan,
  modificationType: DifferentiationType
): DifferentiatedContent {
  // Create adapted version - learning objective MUST be preserved
  const adapted: LessonPlan = {
    ...lessonPlan,
    // Learning objective is NEVER modified
    learningObjective: lessonPlan.learningObjective,
    // Phases may be modified based on differentiation type
    phases: lessonPlan.phases.map(phase => ({
      ...phase,
      // Add differentiation notes if not present
      differentiationNotes: phase.differentiationNotes || {
        support: `Support for ${modificationType}`,
        extension: `Extension for ${modificationType}`,
      },
      // Modify content based on type
      teacherScript: modifyForDifferentiation(phase.teacherScript, modificationType),
      studentAction: modifyForDifferentiation(phase.studentAction, modificationType),
    })),
    // Vocabulary may be simplified for ELL
    keyVocabulary: modificationType === 'ell' 
      ? lessonPlan.keyVocabulary.map(v => ({
          ...v,
          definition: simplifyText(v.definition),
        }))
      : lessonPlan.keyVocabulary,
  };

  return {
    original: lessonPlan,
    modifications: [modificationType],
    adapted,
  };
}

/**
 * Modify text based on differentiation type
 */
function modifyForDifferentiation(text: string, type: DifferentiationType): string {
  switch (type) {
    case 'ell':
      return simplifyText(text);
    case 'advanced':
      return `${text} [Extended: Additional challenge activities]`;
    case 'adhd':
      return `${text} [Chunked into smaller steps]`;
    case 'visual':
      return `${text} [Visual aids recommended]`;
    default:
      return text;
  }
}

/**
 * Simplify text for ELL learners
 */
function simplifyText(text: string): string {
  // Simple simulation - in reality this would use AI
  return text.length > 100 ? text.substring(0, 100) + '...' : text;
}

/**
 * Validate that a lesson plan matches the expected schema
 */
function validateLessonPlanSchema(lessonPlan: LessonPlan): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!lessonPlan.id || lessonPlan.id.length === 0) {
    errors.push('Missing or empty id');
  }

  if (!lessonPlan.topic || lessonPlan.topic.length === 0) {
    errors.push('Missing or empty topic');
  }

  if (!lessonPlan.learningObjective || lessonPlan.learningObjective.length === 0) {
    errors.push('Missing or empty learningObjective');
  }

  if (!lessonPlan.keyVocabulary || lessonPlan.keyVocabulary.length === 0) {
    errors.push('Missing or empty keyVocabulary');
  }

  if (!lessonPlan.phases || lessonPlan.phases.length === 0) {
    errors.push('Missing or empty phases');
  }

  if (!lessonPlan.formativeAssessment) {
    errors.push('Missing formativeAssessment');
  }

  // Validate each phase
  lessonPlan.phases?.forEach((phase, index) => {
    if (!phase.type) {
      errors.push(`Phase ${index}: missing type`);
    }
    if (!phase.name || phase.name.length === 0) {
      errors.push(`Phase ${index}: missing or empty name`);
    }
    if (phase.duration <= 0) {
      errors.push(`Phase ${index}: invalid duration`);
    }
    if (!phase.teacherScript || phase.teacherScript.length === 0) {
      errors.push(`Phase ${index}: missing or empty teacherScript`);
    }
    if (!phase.studentAction || phase.studentAction.length === 0) {
      errors.push(`Phase ${index}: missing or empty studentAction`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

describe('Differentiation Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 19: Differentiation Preserves Objective**
   * **Validates: Requirements 8.5**
   * 
   * *For any* differentiated content, the learningObjective field 
   * SHALL be identical to the original content's learningObjective.
   */
  test('Property 19: differentiation preserves learning objective', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          // Learning objective must be identical
          expect(result.adapted.learningObjective).toBe(result.original.learningObjective);
          expect(result.adapted.learningObjective).toBe(lessonPlan.learningObjective);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 19: Differentiation Preserves Objective**
   * **Validates: Requirements 8.5**
   * 
   * Multiple differentiation types preserve the objective.
   */
  test('Property 19: multiple differentiations preserve objective', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        fc.array(arbitraryDifferentiationType(), { minLength: 1, maxLength: 4 }),
        (lessonPlan, differentiationTypes) => {
          let current = lessonPlan;
          
          differentiationTypes.forEach(type => {
            const result = differentiate(current, type);
            
            // Learning objective must always match original
            expect(result.adapted.learningObjective).toBe(lessonPlan.learningObjective);
            
            current = result.adapted;
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 19: Differentiation Preserves Objective**
   * **Validates: Requirements 8.5**
   * 
   * All differentiation types preserve the objective.
   */
  test('Property 19: all differentiation types preserve objective', () => {
    const allTypes: DifferentiationType[] = ['ell', 'advanced', 'adhd', 'visual'];
    
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        (lessonPlan) => {
          allTypes.forEach(type => {
            const result = differentiate(lessonPlan, type);
            expect(result.adapted.learningObjective).toBe(lessonPlan.learningObjective);
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 20: Differentiation Schema Preservation**
   * **Validates: Requirements 8.6**
   * 
   * *For any* differentiated content, the output SHALL pass the same 
   * schema validation as the original content type.
   */
  test('Property 20: differentiated content passes schema validation', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          // Original should be valid
          const originalValidation = validateLessonPlanSchema(result.original);
          expect(originalValidation.valid).toBe(true);
          
          // Adapted should also be valid
          const adaptedValidation = validateLessonPlanSchema(result.adapted);
          expect(adaptedValidation.valid).toBe(true);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 20: Differentiation Schema Preservation**
   * **Validates: Requirements 8.6**
   * 
   * Differentiated content preserves required fields.
   */
  test('Property 20: differentiated content preserves required fields', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          // ID must be preserved
          expect(result.adapted.id).toBe(lessonPlan.id);
          
          // Topic must be preserved
          expect(result.adapted.topic).toBe(lessonPlan.topic);
          
          // Must have phases
          expect(result.adapted.phases.length).toBeGreaterThan(0);
          
          // Must have vocabulary
          expect(result.adapted.keyVocabulary.length).toBeGreaterThan(0);
          
          // Must have formative assessment
          expect(result.adapted.formativeAssessment).toBeDefined();
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 20: Differentiation Schema Preservation**
   * **Validates: Requirements 8.6**
   * 
   * Phase count is preserved after differentiation.
   */
  test('Property 20: phase count is preserved', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          expect(result.adapted.phases.length).toBe(lessonPlan.phases.length);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 20: Differentiation Schema Preservation**
   * **Validates: Requirements 8.6**
   * 
   * Phase types are preserved after differentiation.
   */
  test('Property 20: phase types are preserved', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          result.adapted.phases.forEach((phase, index) => {
            expect(phase.type).toBe(lessonPlan.phases[index].type);
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 20: Differentiation Schema Preservation**
   * **Validates: Requirements 8.6**
   * 
   * Vocabulary count is preserved (may be modified but not removed).
   */
  test('Property 20: vocabulary count is preserved', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          expect(result.adapted.keyVocabulary.length).toBe(lessonPlan.keyVocabulary.length);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 19: Differentiation Preserves Objective**
   * **Validates: Requirements 8.5**
   * 
   * Differentiation records the modification type.
   */
  test('Property 19: differentiation records modification type', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          expect(result.modifications).toContain(differentiationType);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 20: Differentiation Schema Preservation**
   * **Validates: Requirements 8.6**
   * 
   * Formative assessment is preserved.
   */
  test('Property 20: formative assessment is preserved', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        arbitraryDifferentiationType(),
        (lessonPlan, differentiationType) => {
          const result = differentiate(lessonPlan, differentiationType);
          
          expect(result.adapted.formativeAssessment.type).toBe(lessonPlan.formativeAssessment.type);
          expect(result.adapted.formativeAssessment.question).toBe(lessonPlan.formativeAssessment.question);
        }
      )
    );
  });
});
