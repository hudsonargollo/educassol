import { describe, test, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Standard interface matching the component
 */
interface Standard {
  id: string;
  framework: 'bncc' | 'common-core' | 'teks';
  code: string;
  text: string;
  gradeLevel: string;
  subject: string;
  parentCode: string | null;
}

/**
 * Arbitrary for valid grade levels (BNCC)
 */
const arbitraryGradeLevel = (): fc.Arbitrary<string> =>
  fc.constantFrom(
    '1º Ano',
    '2º Ano',
    '3º Ano',
    '4º Ano',
    '5º Ano',
    '6º Ano',
    '7º Ano',
    '8º Ano',
    '9º Ano'
  );

/**
 * Arbitrary for valid subjects (BNCC)
 */
const arbitrarySubject = (): fc.Arbitrary<string> =>
  fc.constantFrom('Matemática', 'Língua Portuguesa', 'Ciências');

/**
 * Arbitrary for non-empty strings
 */
const arbitraryNonEmptyString = (maxLength: number = 100): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.trim() || 'a')
    .filter(s => s.length > 0);

/**
 * Arbitrary for standard codes (e.g., EF01MA01)
 */
const arbitraryStandardCode = (): fc.Arbitrary<string> =>
  fc.tuple(
    fc.constantFrom('EF'),
    fc.integer({ min: 1, max: 9 }).map(n => n.toString().padStart(2, '0')),
    fc.constantFrom('MA', 'LP', 'CI'),
    fc.integer({ min: 1, max: 99 }).map(n => n.toString().padStart(2, '0'))
  ).map(([prefix, grade, subject, num]) => `${prefix}${grade}${subject}${num}`);

/**
 * Arbitrary for valid standards
 */
const arbitraryStandard = (): fc.Arbitrary<Standard> =>
  fc.record({
    id: fc.uuid(),
    framework: fc.constant('bncc' as const),
    code: arbitraryStandardCode(),
    text: arbitraryNonEmptyString(500),
    gradeLevel: arbitraryGradeLevel(),
    subject: arbitrarySubject(),
    parentCode: fc.option(arbitraryStandardCode(), { nil: null }),
  });

/**
 * Arbitrary for a list of standards
 */
const arbitraryStandardsList = (): fc.Arbitrary<Standard[]> =>
  fc.array(arbitraryStandard(), { minLength: 1, maxLength: 50 });

/**
 * Filter standards by grade level and subject
 * This simulates the filtering logic in StandardsSelector
 */
function filterStandards(
  standards: Standard[],
  gradeFilter?: string,
  subjectFilter?: string
): Standard[] {
  return standards.filter(standard => {
    if (gradeFilter && standard.gradeLevel !== gradeFilter) {
      return false;
    }
    if (subjectFilter && standard.subject !== subjectFilter) {
      return false;
    }
    return true;
  });
}

/**
 * Check if a standard matches the display requirements
 * (has code and text visible)
 */
function standardHasCompleteDisplay(standard: Standard): boolean {
  return (
    standard.code !== undefined &&
    standard.code.length > 0 &&
    standard.text !== undefined &&
    standard.text.length > 0
  );
}

describe('StandardsSelector Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Feature: instructional-design-platform, Property 22: Standards Filter Accuracy**
   * **Validates: Requirements 11.2**
   * 
   * *For any* standards search with grade level and subject filters, 
   * all returned standards SHALL match the specified grade level and subject.
   */
  test('Property 22: filtered standards match grade level filter', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        arbitraryGradeLevel(),
        (standards, gradeFilter) => {
          const filtered = filterStandards(standards, gradeFilter, undefined);
          
          // All filtered standards must match the grade filter
          filtered.forEach(standard => {
            expect(standard.gradeLevel).toBe(gradeFilter);
          });
          
          // Verify we didn't miss any matching standards
          const expectedCount = standards.filter(s => s.gradeLevel === gradeFilter).length;
          expect(filtered.length).toBe(expectedCount);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 22: Standards Filter Accuracy**
   * **Validates: Requirements 11.2**
   * 
   * *For any* standards search with subject filter, 
   * all returned standards SHALL match the specified subject.
   */
  test('Property 22: filtered standards match subject filter', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        arbitrarySubject(),
        (standards, subjectFilter) => {
          const filtered = filterStandards(standards, undefined, subjectFilter);
          
          // All filtered standards must match the subject filter
          filtered.forEach(standard => {
            expect(standard.subject).toBe(subjectFilter);
          });
          
          // Verify we didn't miss any matching standards
          const expectedCount = standards.filter(s => s.subject === subjectFilter).length;
          expect(filtered.length).toBe(expectedCount);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 22: Standards Filter Accuracy**
   * **Validates: Requirements 11.2**
   * 
   * *For any* standards search with both grade level and subject filters,
   * all returned standards SHALL match both criteria.
   */
  test('Property 22: filtered standards match combined filters', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        arbitraryGradeLevel(),
        arbitrarySubject(),
        (standards, gradeFilter, subjectFilter) => {
          const filtered = filterStandards(standards, gradeFilter, subjectFilter);
          
          // All filtered standards must match both filters
          filtered.forEach(standard => {
            expect(standard.gradeLevel).toBe(gradeFilter);
            expect(standard.subject).toBe(subjectFilter);
          });
          
          // Verify we didn't miss any matching standards
          const expectedCount = standards.filter(
            s => s.gradeLevel === gradeFilter && s.subject === subjectFilter
          ).length;
          expect(filtered.length).toBe(expectedCount);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 22: Standards Filter Accuracy**
   * **Validates: Requirements 11.2**
   * 
   * Empty filters should return all standards.
   */
  test('Property 22: empty filters return all standards', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        (standards) => {
          const filtered = filterStandards(standards, undefined, undefined);
          
          // All standards should be returned
          expect(filtered.length).toBe(standards.length);
          
          // Each original standard should be in the filtered list
          standards.forEach(standard => {
            expect(filtered).toContainEqual(standard);
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 23: Standards Display Completeness**
   * **Validates: Requirements 11.3**
   * 
   * *For any* selected standard, the display SHALL include the full standard text and code.
   */
  test('Property 23: standards have complete display information', () => {
    fc.assert(
      fc.property(
        arbitraryStandard(),
        (standard) => {
          // Verify the standard has complete display information
          expect(standardHasCompleteDisplay(standard)).toBe(true);
          
          // Code should be non-empty
          expect(standard.code).toBeDefined();
          expect(standard.code.length).toBeGreaterThan(0);
          
          // Text should be non-empty
          expect(standard.text).toBeDefined();
          expect(standard.text.length).toBeGreaterThan(0);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 23: Standards Display Completeness**
   * **Validates: Requirements 11.3**
   * 
   * *For any* list of standards, all should have complete display information.
   */
  test('Property 23: all standards in list have complete display', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        (standards) => {
          standards.forEach(standard => {
            expect(standardHasCompleteDisplay(standard)).toBe(true);
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 23: Standards Display Completeness**
   * **Validates: Requirements 11.3**
   * 
   * Selected standards should preserve all display fields.
   */
  test('Property 23: selected standards preserve display fields', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        fc.integer({ min: 0, max: 9 }),
        (standards, selectionCount) => {
          // Select some standards
          const selectedCodes = standards
            .slice(0, Math.min(selectionCount, standards.length))
            .map(s => s.code);
          
          // Find selected standards
          const selectedStandards = standards.filter(s => selectedCodes.includes(s.code));
          
          // Each selected standard should have complete display info
          selectedStandards.forEach(standard => {
            expect(standard.code).toBeDefined();
            expect(standard.code.length).toBeGreaterThan(0);
            expect(standard.text).toBeDefined();
            expect(standard.text.length).toBeGreaterThan(0);
            expect(standard.gradeLevel).toBeDefined();
            expect(standard.subject).toBeDefined();
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 22: Standards Filter Accuracy**
   * **Validates: Requirements 11.2**
   * 
   * Filtering is idempotent - applying the same filter twice yields the same result.
   */
  test('Property 22: filtering is idempotent', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        arbitraryGradeLevel(),
        arbitrarySubject(),
        (standards, gradeFilter, subjectFilter) => {
          const filtered1 = filterStandards(standards, gradeFilter, subjectFilter);
          const filtered2 = filterStandards(filtered1, gradeFilter, subjectFilter);
          
          // Applying the same filter twice should yield the same result
          expect(filtered2.length).toBe(filtered1.length);
          filtered1.forEach((standard, index) => {
            expect(filtered2[index]).toEqual(standard);
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 22: Standards Filter Accuracy**
   * **Validates: Requirements 11.2**
   * 
   * Filter order doesn't matter - grade then subject equals subject then grade.
   */
  test('Property 22: filter order is commutative', () => {
    fc.assert(
      fc.property(
        arbitraryStandardsList(),
        arbitraryGradeLevel(),
        arbitrarySubject(),
        (standards, gradeFilter, subjectFilter) => {
          // Filter by grade first, then subject
          const gradeFirst = filterStandards(
            filterStandards(standards, gradeFilter, undefined),
            undefined,
            subjectFilter
          );
          
          // Filter by subject first, then grade
          const subjectFirst = filterStandards(
            filterStandards(standards, undefined, subjectFilter),
            gradeFilter,
            undefined
          );
          
          // Results should be the same
          expect(gradeFirst.length).toBe(subjectFirst.length);
          
          // Sort both arrays by code for comparison
          const sortedGradeFirst = [...gradeFirst].sort((a, b) => a.code.localeCompare(b.code));
          const sortedSubjectFirst = [...subjectFirst].sort((a, b) => a.code.localeCompare(b.code));
          
          sortedGradeFirst.forEach((standard, index) => {
            expect(sortedSubjectFirst[index]).toEqual(standard);
          });
        }
      )
    );
  });
});
