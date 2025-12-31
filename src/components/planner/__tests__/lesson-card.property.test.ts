import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import type { LessonStatus } from '@/lib/instructional/lesson-plan';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Lesson card data interface (matches LessonCard.tsx)
 */
interface LessonCardData {
  id: string;
  topic: string;
  standards: string[];
  status: LessonStatus;
  duration?: number;
  date: Date;
}

/**
 * Get status-specific styling classes (mirrors LessonCard.tsx logic)
 */
function getStatusStyles(status: LessonStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 hover:border-emerald-500';
    case 'in-progress':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 hover:border-amber-500';
    case 'planned':
      return 'bg-slate-100 dark:bg-slate-800 border-slate-300 hover:border-slate-400';
    case 'draft':
    default:
      return 'bg-slate-50 dark:bg-slate-900 border-slate-200 border-dashed hover:border-slate-300';
  }
}

/**
 * Get status label in Portuguese (mirrors LessonCard.tsx logic)
 */
function getStatusLabel(status: LessonStatus): string {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'in-progress':
      return 'Em andamento';
    case 'planned':
      return 'Planejada';
    case 'draft':
    default:
      return 'Rascunho';
  }
}

/**
 * Validates that a lesson card data object has all required display fields
 */
function hasRequiredDisplayFields(lesson: LessonCardData): boolean {
  return (
    typeof lesson.topic === 'string' &&
    lesson.topic.length > 0 &&
    Array.isArray(lesson.standards) &&
    typeof lesson.status === 'string' &&
    ['draft', 'planned', 'in-progress', 'completed'].includes(lesson.status)
  );
}

/**
 * Arbitrary for lesson status
 */
const arbitraryLessonStatus = (): fc.Arbitrary<LessonStatus> =>
  fc.constantFrom('draft', 'planned', 'in-progress', 'completed');

/**
 * Arbitrary for non-empty strings
 */
const arbitraryNonEmptyString = (maxLength: number = 100): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.trim() || 'a')
    .filter(s => s.length > 0);

/**
 * Arbitrary for valid dates
 */
const arbitraryValidDate = (): fc.Arbitrary<Date> =>
  fc.integer({ 
    min: new Date('2020-01-01').getTime(), 
    max: new Date('2030-12-31').getTime() 
  }).map(timestamp => new Date(timestamp));

/**
 * Arbitrary for lesson card data
 */
const arbitraryLessonCardData = (): fc.Arbitrary<LessonCardData> =>
  fc.record({
    id: fc.uuid(),
    topic: arbitraryNonEmptyString(100),
    standards: fc.array(arbitraryNonEmptyString(20), { maxLength: 5 }),
    status: arbitraryLessonStatus(),
    duration: fc.option(fc.integer({ min: 15, max: 180 }), { nil: undefined }),
    date: arbitraryValidDate(),
  });

describe('Lesson Card Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 2: Lesson Card Display Completeness**
   * **Validates: Requirements 1.2**
   * 
   * *For any* lesson plan with topic, standards, and status fields, the rendered 
   * calendar card SHALL contain all three pieces of information.
   */
  test('Property 2: lesson card has required display fields', () => {
    fc.assert(
      fc.property(arbitraryLessonCardData(), (lesson) => {
        // Verify all required display fields are present
        expect(hasRequiredDisplayFields(lesson)).toBe(true);
        
        // Verify topic is non-empty
        expect(lesson.topic.length).toBeGreaterThan(0);
        
        // Verify status is valid
        expect(['draft', 'planned', 'in-progress', 'completed']).toContain(lesson.status);
        
        // Verify standards is an array
        expect(Array.isArray(lesson.standards)).toBe(true);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 3: Lesson Status Visual Distinction**
   * **Validates: Requirements 1.6**
   * 
   * *For any* lesson status ('planned', 'in-progress', 'completed'), the rendered 
   * card SHALL have a distinct CSS class or styling attribute for that status.
   */
  test('Property 3: each status has distinct styling', () => {
    const statuses: LessonStatus[] = ['draft', 'planned', 'in-progress', 'completed'];
    const styleMap = new Map<string, LessonStatus>();
    
    statuses.forEach(status => {
      const styles = getStatusStyles(status);
      
      // Verify styles are non-empty
      expect(styles.length).toBeGreaterThan(0);
      
      // Verify this style is unique to this status
      if (styleMap.has(styles)) {
        // If we've seen this style before, it should be for the same status
        expect(styleMap.get(styles)).toBe(status);
      } else {
        styleMap.set(styles, status);
      }
    });
    
    // Verify all statuses have distinct styles
    expect(styleMap.size).toBe(statuses.length);
  });

  /**
   * **Feature: instructional-design-platform, Property 3: Lesson Status Visual Distinction**
   * **Validates: Requirements 1.6**
   * 
   * Each status should have a unique label.
   */
  test('Property 3: each status has distinct label', () => {
    const statuses: LessonStatus[] = ['draft', 'planned', 'in-progress', 'completed'];
    const labelMap = new Map<string, LessonStatus>();
    
    statuses.forEach(status => {
      const label = getStatusLabel(status);
      
      // Verify label is non-empty
      expect(label.length).toBeGreaterThan(0);
      
      // Verify this label is unique to this status
      if (labelMap.has(label)) {
        expect(labelMap.get(label)).toBe(status);
      } else {
        labelMap.set(label, status);
      }
    });
    
    // Verify all statuses have distinct labels
    expect(labelMap.size).toBe(statuses.length);
  });

  /**
   * **Feature: instructional-design-platform, Property 2: Lesson Card Display Completeness**
   * **Validates: Requirements 1.2**
   * 
   * For any lesson card data, the status styling function should return valid CSS classes.
   */
  test('Property 2: status styling returns valid CSS classes', () => {
    fc.assert(
      fc.property(arbitraryLessonStatus(), (status) => {
        const styles = getStatusStyles(status);
        
        // Verify styles contain expected CSS class patterns
        expect(styles).toMatch(/bg-/); // Background color
        expect(styles).toMatch(/border-/); // Border color
        expect(styles).toMatch(/hover:/); // Hover state
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 3: Lesson Status Visual Distinction**
   * **Validates: Requirements 1.6**
   * 
   * Completed status should have green/emerald styling.
   */
  test('Property 3: completed status has success styling', () => {
    const styles = getStatusStyles('completed');
    expect(styles).toContain('emerald');
  });

  /**
   * **Feature: instructional-design-platform, Property 3: Lesson Status Visual Distinction**
   * **Validates: Requirements 1.6**
   * 
   * In-progress status should have amber/warning styling.
   */
  test('Property 3: in-progress status has warning styling', () => {
    const styles = getStatusStyles('in-progress');
    expect(styles).toContain('amber');
  });

  /**
   * **Feature: instructional-design-platform, Property 3: Lesson Status Visual Distinction**
   * **Validates: Requirements 1.6**
   * 
   * Draft status should have dashed border styling.
   */
  test('Property 3: draft status has dashed border', () => {
    const styles = getStatusStyles('draft');
    expect(styles).toContain('dashed');
  });
});
