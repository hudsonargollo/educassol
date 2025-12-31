import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateLeveledReading,
  serializeLeveledReading,
  deserializeLeveledReading,
  LEXILE_LEVEL_RANGES,
  type LeveledReading,
  type LeveledPassages,
} from '../leveled-reading';

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
 * Arbitrary for leveled passages with proper Lexile ordering
 * Ensures easy < medium < hard
 */
const arbitraryLeveledPassages = (): fc.Arbitrary<LeveledPassages> =>
  fc.tuple(
    fc.integer({ min: 400, max: 600 }),   // easy Lexile
    fc.integer({ min: 100, max: 200 }),   // gap to medium
    fc.integer({ min: 100, max: 200 })    // gap to hard
  ).chain(([easyLexile, gap1, gap2]) => {
    const mediumLexile = easyLexile + gap1;
    const hardLexile = mediumLexile + gap2;
    
    return fc.record({
      easy: fc.record({
        text: arbitraryNonEmptyString(500),
        lexileLevel: fc.constant(easyLexile),
      }),
      medium: fc.record({
        text: arbitraryNonEmptyString(500),
        lexileLevel: fc.constant(mediumLexile),
      }),
      hard: fc.record({
        text: arbitraryNonEmptyString(500),
        lexileLevel: fc.constant(hardLexile),
      }),
    });
  });

/**
 * Arbitrary for valid leveled readings
 */
const arbitraryLeveledReading = (): fc.Arbitrary<LeveledReading> =>
  fc.record({
    id: fc.uuid(),
    lessonPlanId: fc.uuid(),
    topic: arbitraryNonEmptyString(100),
    passages: arbitraryLeveledPassages(),
    coreConceptsPreserved: fc.array(arbitraryNonEmptyString(100), { minLength: 1, maxLength: 5 }),
    createdAt: arbitraryValidDate(),
  });

describe('Leveled Reading Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 9: Leveled Reading Structure**
   * **Validates: Requirements 4.2, 4.4**
   * 
   * *For any* generated leveled reading, it SHALL have passages.easy, passages.medium, 
   * and passages.hard fields, each with non-empty text and distinct lexileLevel values 
   * where easy.lexileLevel < medium.lexileLevel < hard.lexileLevel.
   */
  test('Property 9: leveled reading has three distinct Lexile levels', () => {
    fc.assert(
      fc.property(arbitraryLeveledReading(), (leveledReading) => {
        const result = validateLeveledReading(leveledReading);
        expect(result.success).toBe(true);
        
        // Verify all three levels exist
        expect(result.data?.passages.easy).toBeDefined();
        expect(result.data?.passages.medium).toBeDefined();
        expect(result.data?.passages.hard).toBeDefined();
        
        // Verify each has non-empty text
        expect(result.data?.passages.easy.text.length).toBeGreaterThan(0);
        expect(result.data?.passages.medium.text.length).toBeGreaterThan(0);
        expect(result.data?.passages.hard.text.length).toBeGreaterThan(0);
        
        // Verify Lexile ordering: easy < medium < hard
        const easyLexile = result.data?.passages.easy.lexileLevel || 0;
        const mediumLexile = result.data?.passages.medium.lexileLevel || 0;
        const hardLexile = result.data?.passages.hard.lexileLevel || 0;
        
        expect(easyLexile).toBeLessThan(mediumLexile);
        expect(mediumLexile).toBeLessThan(hardLexile);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 9: Leveled Reading Structure**
   * **Validates: Requirements 4.2, 4.4**
   * 
   * Leveled readings with incorrect Lexile ordering should be rejected.
   */
  test('Property 9: incorrect Lexile ordering is rejected', () => {
    // Easy >= Medium
    const invalidReading1 = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      topic: 'Test Topic',
      passages: {
        easy: { text: 'Easy text', lexileLevel: 800 },
        medium: { text: 'Medium text', lexileLevel: 700 }, // Less than easy!
        hard: { text: 'Hard text', lexileLevel: 1000 },
      },
      coreConceptsPreserved: ['Concept 1'],
      createdAt: new Date(),
    };
    
    const result1 = validateLeveledReading(invalidReading1);
    expect(result1.success).toBe(false);
    
    // Medium >= Hard
    const invalidReading2 = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      topic: 'Test Topic',
      passages: {
        easy: { text: 'Easy text', lexileLevel: 500 },
        medium: { text: 'Medium text', lexileLevel: 1000 },
        hard: { text: 'Hard text', lexileLevel: 900 }, // Less than medium!
      },
      coreConceptsPreserved: ['Concept 1'],
      createdAt: new Date(),
    };
    
    const result2 = validateLeveledReading(invalidReading2);
    expect(result2.success).toBe(false);
  });

  /**
   * **Feature: instructional-design-platform, Property 9: Leveled Reading Structure**
   * **Validates: Requirements 4.2, 4.4**
   * 
   * Leveled reading serialization round-trip preserves data.
   */
  test('Property 9: leveled reading serialization round-trip preserves data', () => {
    fc.assert(
      fc.property(arbitraryLeveledReading(), (leveledReading) => {
        // Serialize to JSON
        const json = serializeLeveledReading(leveledReading);
        
        // Deserialize back
        const result = deserializeLeveledReading(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify core fields are preserved
        expect(result.data?.id).toBe(leveledReading.id);
        expect(result.data?.lessonPlanId).toBe(leveledReading.lessonPlanId);
        expect(result.data?.topic).toBe(leveledReading.topic);
        
        // Verify passages are preserved
        expect(result.data?.passages.easy.text).toBe(leveledReading.passages.easy.text);
        expect(result.data?.passages.easy.lexileLevel).toBe(leveledReading.passages.easy.lexileLevel);
        expect(result.data?.passages.medium.text).toBe(leveledReading.passages.medium.text);
        expect(result.data?.passages.medium.lexileLevel).toBe(leveledReading.passages.medium.lexileLevel);
        expect(result.data?.passages.hard.text).toBe(leveledReading.passages.hard.text);
        expect(result.data?.passages.hard.lexileLevel).toBe(leveledReading.passages.hard.lexileLevel);
        
        // Verify core concepts are preserved
        expect(result.data?.coreConceptsPreserved).toEqual(leveledReading.coreConceptsPreserved);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 9: Leveled Reading Structure**
   * **Validates: Requirements 4.2, 4.4**
   * 
   * Valid leveled readings should pass validation.
   */
  test('Property 9: valid leveled readings are accepted', () => {
    fc.assert(
      fc.property(arbitraryLeveledReading(), (leveledReading) => {
        const result = validateLeveledReading(leveledReading);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 9: Leveled Reading Structure**
   * **Validates: Requirements 4.2, 4.4**
   * 
   * Invalid JSON strings should be rejected during deserialization.
   */
  test('Property 9: invalid JSON strings are rejected', () => {
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
          const result = deserializeLeveledReading(invalidJson);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 9: Leveled Reading Structure**
   * **Validates: Requirements 4.2, 4.4**
   * 
   * Lexile level ranges are properly defined.
   */
  test('Property 9: Lexile level ranges are properly ordered', () => {
    expect(LEXILE_LEVEL_RANGES.easy.max).toBeLessThan(LEXILE_LEVEL_RANGES.medium.min);
    expect(LEXILE_LEVEL_RANGES.medium.max).toBeLessThan(LEXILE_LEVEL_RANGES.hard.min);
  });
});
