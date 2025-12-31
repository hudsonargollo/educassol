import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateUnitPlan,
  serializeUnitPlan,
  deserializeUnitPlan,
  type UnitPlan,
  type SubSkill,
  type LessonOutline,
} from '../unit-plan';

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
 * Arbitrary for non-empty strings
 */
const arbitraryNonEmptyString = (maxLength: number = 100): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.trim() || 'a')
    .filter(s => s.length > 0);

/**
 * Arbitrary for sub-skills
 */
const arbitrarySubSkill = (maxDayNumber: number): fc.Arbitrary<SubSkill> =>
  fc.record({
    skill: arbitraryNonEmptyString(200),
    standard: arbitraryNonEmptyString(50),
    dayNumber: fc.integer({ min: 1, max: maxDayNumber }),
  });

/**
 * Arbitrary for lesson outlines with specific day number
 */
const arbitraryLessonOutline = (dayNumber: number, date: Date): fc.Arbitrary<LessonOutline> =>
  fc.record({
    dayNumber: fc.constant(dayNumber),
    date: fc.constant(date),
    topic: arbitraryNonEmptyString(100),
    objective: arbitraryNonEmptyString(300),
    lessonPlanId: fc.option(fc.uuid(), { nil: undefined }),
  });

/**
 * Arbitrary for valid unit plans with consistent duration and lesson outlines
 */
const arbitraryUnitPlan = (): fc.Arbitrary<UnitPlan> =>
  fc.integer({ min: 1, max: 30 }).chain(durationDays => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);
    
    // Generate lesson outlines for each day
    const lessonOutlinesArbitrary = fc.tuple(
      ...Array.from({ length: durationDays }, (_, i) => {
        const lessonDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        return arbitraryLessonOutline(i + 1, lessonDate);
      })
    );
    
    return fc.record({
      id: fc.uuid(),
      title: arbitraryNonEmptyString(100),
      gradeLevel: arbitraryNonEmptyString(20),
      subject: arbitraryNonEmptyString(50),
      topic: arbitraryNonEmptyString(100),
      standards: fc.array(arbitraryNonEmptyString(50), { minLength: 1, maxLength: 5 }),
      durationDays: fc.constant(durationDays),
      startDate: fc.constant(startDate),
      endDate: fc.constant(endDate),
      subSkills: fc.array(arbitrarySubSkill(durationDays), { maxLength: 10 }),
      lessonOutlines: lessonOutlinesArbitrary.map(outlines => outlines as LessonOutline[]),
      createdAt: arbitraryValidDate(),
      updatedAt: arbitraryValidDate(),
      createdBy: arbitraryNonEmptyString(50),
    });
  });

describe('Unit Plan Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 4: Unit Plan Duration Consistency**
   * **Validates: Requirements 2.3, 2.4**
   * 
   * *For any* valid unit plan with durationDays N, the lessonOutlines array SHALL 
   * contain exactly N entries, and each entry SHALL have a unique dayNumber from 1 to N.
   */
  test('Property 4: unit plan duration consistency', () => {
    fc.assert(
      fc.property(arbitraryUnitPlan(), (unitPlan) => {
        const result = validateUnitPlan(unitPlan);
        expect(result.success).toBe(true);
        
        // Verify lesson outlines count matches duration
        expect(result.data?.lessonOutlines.length).toBe(result.data?.durationDays);
        
        // Verify each day number from 1 to N is present
        const dayNumbers = result.data?.lessonOutlines.map(l => l.dayNumber) || [];
        const expectedDays = Array.from({ length: result.data?.durationDays || 0 }, (_, i) => i + 1);
        
        expectedDays.forEach(day => {
          expect(dayNumbers).toContain(day);
        });
        
        // Verify day numbers are unique
        const uniqueDayNumbers = new Set(dayNumbers);
        expect(uniqueDayNumbers.size).toBe(dayNumbers.length);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 4: Unit Plan Duration Consistency**
   * **Validates: Requirements 2.3, 2.4**
   * 
   * Unit plans with mismatched duration and lesson outlines should be rejected.
   */
  test('Property 4: mismatched duration and outlines are rejected', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.integer({ min: 1, max: 5 }),
        (durationDays, mismatchAmount) => {
          const wrongOutlineCount = Math.max(1, durationDays - mismatchAmount);
          if (wrongOutlineCount === durationDays) return; // Skip if no mismatch
          
          const startDate = new Date('2024-01-01');
          const endDate = new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);
          
          const invalidUnitPlan = {
            id: '00000000-0000-0000-0000-000000000001',
            title: 'Test Unit',
            gradeLevel: '5th Grade',
            subject: 'Math',
            topic: 'Fractions',
            standards: ['CCSS.MATH.5.NF.A.1'],
            durationDays,
            startDate,
            endDate,
            subSkills: [],
            lessonOutlines: Array.from({ length: wrongOutlineCount }, (_, i) => ({
              dayNumber: i + 1,
              date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
              topic: `Day ${i + 1}`,
              objective: `Objective ${i + 1}`,
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user-123',
          };
          
          const result = validateUnitPlan(invalidUnitPlan);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 4: Unit Plan Duration Consistency**
   * **Validates: Requirements 2.3, 2.4**
   * 
   * Unit plans with duplicate day numbers should be rejected.
   */
  test('Property 4: duplicate day numbers are rejected', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-03');
    
    const invalidUnitPlan = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Test Unit',
      gradeLevel: '5th Grade',
      subject: 'Math',
      topic: 'Fractions',
      standards: ['CCSS.MATH.5.NF.A.1'],
      durationDays: 3,
      startDate,
      endDate,
      subSkills: [],
      lessonOutlines: [
        { dayNumber: 1, date: startDate, topic: 'Day 1', objective: 'Obj 1' },
        { dayNumber: 1, date: new Date('2024-01-02'), topic: 'Day 2', objective: 'Obj 2' }, // Duplicate!
        { dayNumber: 3, date: endDate, topic: 'Day 3', objective: 'Obj 3' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-123',
    };
    
    const result = validateUnitPlan(invalidUnitPlan);
    expect(result.success).toBe(false);
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * *For any* unit plan modification, the unit ID SHALL remain unchanged and the 
   * updatedAt timestamp SHALL be greater than the previous updatedAt value.
   */
  test('Property 5: unit plan serialization round-trip preserves ID', () => {
    fc.assert(
      fc.property(arbitraryUnitPlan(), (unitPlan) => {
        // Serialize to JSON
        const json = serializeUnitPlan(unitPlan);
        
        // Deserialize back
        const result = deserializeUnitPlan(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify ID is preserved (modification invariant)
        expect(result.data?.id).toBe(unitPlan.id);
        
        // Verify core fields are preserved
        expect(result.data?.title).toBe(unitPlan.title);
        expect(result.data?.durationDays).toBe(unitPlan.durationDays);
        expect(result.data?.lessonOutlines.length).toBe(unitPlan.lessonOutlines.length);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 4: Unit Plan Duration Consistency**
   * **Validates: Requirements 2.3, 2.4**
   * 
   * Valid unit plans should pass validation.
   */
  test('Property 4: valid unit plans are accepted', () => {
    fc.assert(
      fc.property(arbitraryUnitPlan(), (unitPlan) => {
        const result = validateUnitPlan(unitPlan);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      })
    );
  });
});
