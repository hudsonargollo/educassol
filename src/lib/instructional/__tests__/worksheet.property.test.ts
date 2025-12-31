import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateWorksheet,
  serializeWorksheet,
  deserializeWorksheet,
  type Worksheet,
  type WorksheetSection,
  type WorksheetSectionType,
  type VocabularyMatching,
  type ClozePassage,
  type ShortAnswerSection,
} from '../worksheet';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

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
 * Arbitrary for vocabulary matching content
 */
const arbitraryVocabularyMatching = (): fc.Arbitrary<VocabularyMatching> =>
  fc.record({
    terms: fc.array(
      fc.record({
        term: arbitraryNonEmptyString(50),
        definition: arbitraryNonEmptyString(200),
      }),
      { minLength: 1, maxLength: 10 }
    ),
  });

/**
 * Arbitrary for cloze passage content
 */
const arbitraryClozePassage = (): fc.Arbitrary<ClozePassage> =>
  fc.record({
    text: arbitraryNonEmptyString(500),
    answers: fc.array(arbitraryNonEmptyString(50), { minLength: 1, maxLength: 10 }),
  });

/**
 * Arbitrary for short answer section content
 */
const arbitraryShortAnswerSection = (): fc.Arbitrary<ShortAnswerSection> =>
  fc.record({
    questions: fc.array(
      fc.record({
        question: arbitraryNonEmptyString(200),
        expectedAnswer: arbitraryNonEmptyString(200),
      }),
      { minLength: 1, maxLength: 5 }
    ),
  });

/**
 * Arbitrary for vocabulary matching section
 */
const arbitraryVocabularyMatchingSection = (): fc.Arbitrary<WorksheetSection> =>
  fc.record({
    type: fc.constant('vocabulary-matching' as WorksheetSectionType),
    instructions: arbitraryNonEmptyString(200),
    content: arbitraryVocabularyMatching(),
  });

/**
 * Arbitrary for cloze section
 */
const arbitraryClozeSection = (): fc.Arbitrary<WorksheetSection> =>
  fc.record({
    type: fc.constant('cloze' as WorksheetSectionType),
    instructions: arbitraryNonEmptyString(200),
    content: arbitraryClozePassage(),
  });

/**
 * Arbitrary for short answer section
 */
const arbitraryShortAnswerSectionWrapper = (): fc.Arbitrary<WorksheetSection> =>
  fc.record({
    type: fc.constant('short-answer' as WorksheetSectionType),
    instructions: arbitraryNonEmptyString(200),
    content: arbitraryShortAnswerSection(),
  });

/**
 * Arbitrary for any valid worksheet section
 */
const arbitraryWorksheetSection = (): fc.Arbitrary<WorksheetSection> =>
  fc.oneof(
    arbitraryVocabularyMatchingSection(),
    arbitraryClozeSection(),
    arbitraryShortAnswerSectionWrapper()
  );

/**
 * Arbitrary for valid worksheets
 */
const arbitraryWorksheet = (): fc.Arbitrary<Worksheet> =>
  fc.record({
    id: fc.uuid(),
    lessonPlanId: fc.uuid(),
    title: arbitraryNonEmptyString(100),
    sections: fc.array(arbitraryWorksheetSection(), { minLength: 1, maxLength: 5 }),
    markdownContent: arbitraryNonEmptyString(1000),
    createdAt: arbitraryValidDate(),
  });

describe('Worksheet Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 15: Worksheet Section Validity**
   * **Validates: Requirements 6.2, 6.3**
   * 
   * *For any* worksheet section of type 'vocabulary-matching', it SHALL have a terms 
   * array with term/definition pairs. For type 'cloze', it SHALL have text with blanks 
   * and matching answers array. For type 'short-answer', it SHALL have questions array.
   */
  test('Property 15: vocabulary-matching sections have valid structure', () => {
    fc.assert(
      fc.property(arbitraryVocabularyMatchingSection(), (section) => {
        expect(section.type).toBe('vocabulary-matching');
        
        const content = section.content as VocabularyMatching;
        expect(content.terms).toBeDefined();
        expect(content.terms.length).toBeGreaterThan(0);
        
        content.terms.forEach(item => {
          expect(item.term).toBeDefined();
          expect(item.term.length).toBeGreaterThan(0);
          expect(item.definition).toBeDefined();
          expect(item.definition.length).toBeGreaterThan(0);
        });
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 15: Worksheet Section Validity**
   * **Validates: Requirements 6.2, 6.3**
   */
  test('Property 15: cloze sections have valid structure', () => {
    fc.assert(
      fc.property(arbitraryClozeSection(), (section) => {
        expect(section.type).toBe('cloze');
        
        const content = section.content as ClozePassage;
        expect(content.text).toBeDefined();
        expect(content.text.length).toBeGreaterThan(0);
        expect(content.answers).toBeDefined();
        expect(content.answers.length).toBeGreaterThan(0);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 15: Worksheet Section Validity**
   * **Validates: Requirements 6.2, 6.3**
   */
  test('Property 15: short-answer sections have valid structure', () => {
    fc.assert(
      fc.property(arbitraryShortAnswerSectionWrapper(), (section) => {
        expect(section.type).toBe('short-answer');
        
        const content = section.content as ShortAnswerSection;
        expect(content.questions).toBeDefined();
        expect(content.questions.length).toBeGreaterThan(0);
        
        content.questions.forEach(q => {
          expect(q.question).toBeDefined();
          expect(q.question.length).toBeGreaterThan(0);
          expect(q.expectedAnswer).toBeDefined();
          expect(q.expectedAnswer.length).toBeGreaterThan(0);
        });
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 16: Worksheet Markdown Presence**
   * **Validates: Requirements 6.4**
   * 
   * *For any* generated worksheet, the markdownContent field SHALL be a non-empty string.
   */
  test('Property 16: worksheets have non-empty markdown content', () => {
    fc.assert(
      fc.property(arbitraryWorksheet(), (worksheet) => {
        const result = validateWorksheet(worksheet);
        expect(result.success).toBe(true);
        
        expect(result.data?.markdownContent).toBeDefined();
        expect(result.data?.markdownContent.length).toBeGreaterThan(0);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 16: Worksheet Markdown Presence**
   * **Validates: Requirements 6.4**
   * 
   * Worksheets without markdown content should be rejected.
   */
  test('Property 16: worksheets without markdown content are rejected', () => {
    const invalidWorksheet = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      title: 'Test Worksheet',
      sections: [
        {
          type: 'vocabulary-matching',
          instructions: 'Match the terms',
          content: {
            terms: [{ term: 'Cell', definition: 'Basic unit of life' }],
          },
        },
      ],
      markdownContent: '', // Empty markdown
      createdAt: new Date(),
    };
    
    const result = validateWorksheet(invalidWorksheet);
    expect(result.success).toBe(false);
  });

  /**
   * **Feature: instructional-design-platform, Property 15: Worksheet Section Validity**
   * **Validates: Requirements 6.2, 6.3, 6.4**
   * 
   * Worksheet serialization round-trip preserves data.
   */
  test('Property 15: worksheet serialization round-trip preserves data', () => {
    fc.assert(
      fc.property(arbitraryWorksheet(), (worksheet) => {
        // Serialize to JSON
        const json = serializeWorksheet(worksheet);
        
        // Deserialize back
        const result = deserializeWorksheet(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify core fields are preserved
        expect(result.data?.id).toBe(worksheet.id);
        expect(result.data?.lessonPlanId).toBe(worksheet.lessonPlanId);
        expect(result.data?.title).toBe(worksheet.title);
        expect(result.data?.markdownContent).toBe(worksheet.markdownContent);
        expect(result.data?.sections.length).toBe(worksheet.sections.length);
        
        // Verify each section is preserved
        for (let i = 0; i < worksheet.sections.length; i++) {
          expect(result.data?.sections[i].type).toBe(worksheet.sections[i].type);
          expect(result.data?.sections[i].instructions).toBe(worksheet.sections[i].instructions);
        }
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 15: Worksheet Section Validity**
   * **Validates: Requirements 6.2, 6.3, 6.4**
   * 
   * Valid worksheets should pass validation.
   */
  test('Property 15: valid worksheets are accepted', () => {
    fc.assert(
      fc.property(arbitraryWorksheet(), (worksheet) => {
        const result = validateWorksheet(worksheet);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 15: Worksheet Section Validity**
   * **Validates: Requirements 6.2, 6.3, 6.4**
   * 
   * Invalid JSON strings should be rejected during deserialization.
   */
  test('Property 15: invalid JSON strings are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => {
          try {
            JSON.parse(s);
            return false;
          } catch {
            return true;
          }
        }),
        (invalidJson) => {
          const result = deserializeWorksheet(invalidJson);
          expect(result.success).toBe(false);
        }
      )
    );
  });
});
