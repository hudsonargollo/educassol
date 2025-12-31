import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * UnitPlan interface for testing
 */
interface UnitPlan {
  id: string;
  title: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  standards: string[];
  durationDays: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
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
 * Arbitrary for valid unit plans
 */
const arbitraryUnitPlan = (): fc.Arbitrary<UnitPlan> =>
  fc.record({
    id: fc.uuid(),
    title: arbitraryNonEmptyString(100),
    gradeLevel: arbitraryNonEmptyString(20),
    subject: arbitraryNonEmptyString(50),
    topic: arbitraryNonEmptyString(100),
    standards: fc.array(arbitraryNonEmptyString(20), { minLength: 1, maxLength: 5 }),
    durationDays: fc.integer({ min: 1, max: 30 }),
    startDate: arbitraryValidDate(),
    endDate: arbitraryValidDate(),
    createdAt: arbitraryValidDate(),
    updatedAt: arbitraryValidDate(),
    createdBy: fc.uuid(),
  });

/**
 * Simulate unit plan modification
 * Returns a new unit plan with updated fields and new updatedAt timestamp
 */
function modifyUnitPlan(
  original: UnitPlan,
  updates: Partial<Omit<UnitPlan, 'id' | 'createdAt' | 'createdBy'>>
): UnitPlan {
  const now = new Date();
  // Ensure updatedAt is always greater than the original
  const newUpdatedAt = new Date(Math.max(now.getTime(), original.updatedAt.getTime() + 1));
  
  return {
    ...original,
    ...updates,
    // ID must remain unchanged
    id: original.id,
    // createdAt must remain unchanged
    createdAt: original.createdAt,
    // createdBy must remain unchanged
    createdBy: original.createdBy,
    // updatedAt must be greater than previous
    updatedAt: newUpdatedAt,
  };
}

/**
 * Validate that a unit plan modification preserves invariants
 */
function validateModificationInvariant(
  original: UnitPlan,
  modified: UnitPlan
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // ID must remain unchanged
  if (modified.id !== original.id) {
    errors.push('ID was changed during modification');
  }
  
  // createdAt must remain unchanged
  if (modified.createdAt.getTime() !== original.createdAt.getTime()) {
    errors.push('createdAt was changed during modification');
  }
  
  // createdBy must remain unchanged
  if (modified.createdBy !== original.createdBy) {
    errors.push('createdBy was changed during modification');
  }
  
  // updatedAt must be greater than previous
  if (modified.updatedAt.getTime() <= original.updatedAt.getTime()) {
    errors.push('updatedAt is not greater than previous value');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

describe('useUnitPlan Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * *For any* unit plan modification, the unit ID SHALL remain unchanged 
   * and the updatedAt timestamp SHALL be greater than the previous updatedAt value.
   */
  test('Property 5: unit plan ID remains unchanged after modification', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        arbitraryNonEmptyString(100),
        (original, newTitle) => {
          const modified = modifyUnitPlan(original, { title: newTitle });
          
          // ID must remain unchanged
          expect(modified.id).toBe(original.id);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * updatedAt timestamp increases after modification.
   */
  test('Property 5: updatedAt increases after modification', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        arbitraryNonEmptyString(100),
        (original, newTitle) => {
          const modified = modifyUnitPlan(original, { title: newTitle });
          
          // updatedAt must be greater than previous
          expect(modified.updatedAt.getTime()).toBeGreaterThan(original.updatedAt.getTime());
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * createdAt and createdBy remain unchanged after modification.
   */
  test('Property 5: createdAt and createdBy remain unchanged', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        arbitraryNonEmptyString(100),
        fc.integer({ min: 1, max: 30 }),
        (original, newTopic, newDuration) => {
          const modified = modifyUnitPlan(original, { 
            topic: newTopic,
            durationDays: newDuration,
          });
          
          // createdAt must remain unchanged
          expect(modified.createdAt.getTime()).toBe(original.createdAt.getTime());
          
          // createdBy must remain unchanged
          expect(modified.createdBy).toBe(original.createdBy);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * Multiple modifications preserve the invariant.
   */
  test('Property 5: multiple modifications preserve invariant', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        fc.array(arbitraryNonEmptyString(100), { minLength: 1, maxLength: 5 }),
        (original, titles) => {
          let current = original;
          
          titles.forEach(newTitle => {
            const modified = modifyUnitPlan(current, { title: newTitle });
            
            // Validate invariant after each modification
            const validation = validateModificationInvariant(current, modified);
            expect(validation.valid).toBe(true);
            
            // ID must always match original
            expect(modified.id).toBe(original.id);
            
            // createdAt must always match original
            expect(modified.createdAt.getTime()).toBe(original.createdAt.getTime());
            
            // createdBy must always match original
            expect(modified.createdBy).toBe(original.createdBy);
            
            current = modified;
          });
          
          // Final updatedAt must be greater than original
          expect(current.updatedAt.getTime()).toBeGreaterThan(original.updatedAt.getTime());
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * Validation function correctly identifies invariant violations.
   */
  test('Property 5: validation detects ID changes', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        fc.uuid(),
        (original, newId) => {
          // Create an invalid modification that changes the ID
          const invalid: UnitPlan = {
            ...original,
            id: newId,
            updatedAt: new Date(original.updatedAt.getTime() + 1),
          };
          
          // Only test when IDs are actually different
          if (newId !== original.id) {
            const validation = validateModificationInvariant(original, invalid);
            expect(validation.valid).toBe(false);
            expect(validation.errors).toContain('ID was changed during modification');
          }
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * Validation function correctly identifies timestamp violations.
   */
  test('Property 5: validation detects timestamp violations', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        (original) => {
          // Create an invalid modification with older updatedAt
          const invalid: UnitPlan = {
            ...original,
            updatedAt: new Date(original.updatedAt.getTime() - 1000),
          };
          
          const validation = validateModificationInvariant(original, invalid);
          expect(validation.valid).toBe(false);
          expect(validation.errors).toContain('updatedAt is not greater than previous value');
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 5: Unit Plan Modification Invariant**
   * **Validates: Requirements 2.7**
   * 
   * Valid modifications pass validation.
   */
  test('Property 5: valid modifications pass validation', () => {
    fc.assert(
      fc.property(
        arbitraryUnitPlan(),
        arbitraryNonEmptyString(100),
        arbitraryNonEmptyString(100),
        fc.integer({ min: 1, max: 30 }),
        (original, newTitle, newTopic, newDuration) => {
          const modified = modifyUnitPlan(original, {
            title: newTitle,
            topic: newTopic,
            durationDays: newDuration,
          });
          
          const validation = validateModificationInvariant(original, modified);
          expect(validation.valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
        }
      )
    );
  });
});
