import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Activity types
 */
type ActivityType = 'quiz' | 'worksheet' | 'reading' | 'slides';

/**
 * Generated activity
 */
interface GeneratedActivity {
  id: string;
  lessonPlanId: string;
  type: ActivityType;
  title: string;
  createdAt: Date;
}

/**
 * Lesson plan
 */
interface LessonPlan {
  id: string;
  topic: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lesson with activities
 */
interface LessonWithActivities {
  lessonPlan: LessonPlan;
  activities: {
    quizzes: GeneratedActivity[];
    worksheets: GeneratedActivity[];
    readings: GeneratedActivity[];
    slides: GeneratedActivity[];
  };
  totalActivities: number;
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
 * Arbitrary for activity types
 */
const arbitraryActivityType = (): fc.Arbitrary<ActivityType> =>
  fc.constantFrom('quiz', 'worksheet', 'reading', 'slides');

/**
 * Arbitrary for lesson plans
 */
const arbitraryLessonPlan = (): fc.Arbitrary<LessonPlan> =>
  fc.record({
    id: fc.uuid(),
    topic: arbitraryNonEmptyString(100),
    createdAt: arbitraryValidDate(),
    updatedAt: arbitraryValidDate(),
  });

/**
 * Arbitrary for generated activities with a specific lesson plan ID
 */
const arbitraryActivity = (lessonPlanId: string): fc.Arbitrary<GeneratedActivity> =>
  fc.record({
    id: fc.uuid(),
    lessonPlanId: fc.constant(lessonPlanId),
    type: arbitraryActivityType(),
    title: arbitraryNonEmptyString(100),
    createdAt: arbitraryValidDate(),
  });

/**
 * Arbitrary for a list of activities for a lesson plan
 */
const arbitraryActivitiesList = (lessonPlanId: string): fc.Arbitrary<GeneratedActivity[]> =>
  fc.array(arbitraryActivity(lessonPlanId), { minLength: 0, maxLength: 20 });

/**
 * Group activities by type
 */
function groupActivitiesByType(activities: GeneratedActivity[]): LessonWithActivities['activities'] {
  return {
    quizzes: activities.filter(a => a.type === 'quiz'),
    worksheets: activities.filter(a => a.type === 'worksheet'),
    readings: activities.filter(a => a.type === 'reading'),
    slides: activities.filter(a => a.type === 'slides'),
  };
}

/**
 * Create a LessonWithActivities object
 */
function createLessonWithActivities(
  lessonPlan: LessonPlan,
  activities: GeneratedActivity[]
): LessonWithActivities {
  const grouped = groupActivitiesByType(activities);
  return {
    lessonPlan,
    activities: grouped,
    totalActivities: activities.length,
  };
}

/**
 * Get all activities from a LessonWithActivities object
 */
function getAllActivities(lessonWithActivities: LessonWithActivities): GeneratedActivity[] {
  const { activities } = lessonWithActivities;
  return [
    ...activities.quizzes,
    ...activities.worksheets,
    ...activities.readings,
    ...activities.slides,
  ];
}

/**
 * Check if all activities reference the correct lesson plan
 */
function allActivitiesReferenceLesson(
  lessonWithActivities: LessonWithActivities
): boolean {
  const allActivities = getAllActivities(lessonWithActivities);
  return allActivities.every(
    activity => activity.lessonPlanId === lessonWithActivities.lessonPlan.id
  );
}

/**
 * Arbitrary for lesson plan with activities together
 */
const arbitraryLessonPlanWithActivities = (): fc.Arbitrary<{ lessonPlan: LessonPlan; activities: GeneratedActivity[] }> =>
  fc.uuid().chain(lessonPlanId =>
    fc.record({
      lessonPlan: fc.record({
        id: fc.constant(lessonPlanId),
        topic: arbitraryNonEmptyString(100),
        createdAt: arbitraryValidDate(),
        updatedAt: arbitraryValidDate(),
      }),
      activities: fc.array(arbitraryActivity(lessonPlanId), { minLength: 0, maxLength: 20 }),
    })
  );

describe('useLessonWithActivities Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * *For any* retrieved lesson plan, it SHALL include all associated activities 
   * (quizzes, worksheets, readings) that reference its ID.
   */
  test('Property 26: retrieved lesson includes all associated activities', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanWithActivities(),
        ({ lessonPlan, activities }) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, activities);
          
          // Total activities should match
          expect(lessonWithActivities.totalActivities).toBe(activities.length);
          
          // All activities should be included
          const allRetrieved = getAllActivities(lessonWithActivities);
          expect(allRetrieved.length).toBe(activities.length);
          
          // Each original activity should be in the result
          activities.forEach(activity => {
            const found = allRetrieved.some(a => a.id === activity.id);
            expect(found).toBe(true);
          });
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * All activities reference the correct lesson plan ID.
   */
  test('Property 26: all activities reference correct lesson plan', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanWithActivities(),
        ({ lessonPlan, activities }) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, activities);
          
          expect(allActivitiesReferenceLesson(lessonWithActivities)).toBe(true);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * Activities are correctly grouped by type.
   */
  test('Property 26: activities are correctly grouped by type', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanWithActivities(),
        ({ lessonPlan, activities }) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, activities);
          
          // Count activities by type in original list
          const quizCount = activities.filter(a => a.type === 'quiz').length;
          const worksheetCount = activities.filter(a => a.type === 'worksheet').length;
          const readingCount = activities.filter(a => a.type === 'reading').length;
          const slidesCount = activities.filter(a => a.type === 'slides').length;
          
          // Verify grouping
          expect(lessonWithActivities.activities.quizzes.length).toBe(quizCount);
          expect(lessonWithActivities.activities.worksheets.length).toBe(worksheetCount);
          expect(lessonWithActivities.activities.readings.length).toBe(readingCount);
          expect(lessonWithActivities.activities.slides.length).toBe(slidesCount);
          
          // Verify each grouped activity has correct type
          lessonWithActivities.activities.quizzes.forEach(a => expect(a.type).toBe('quiz'));
          lessonWithActivities.activities.worksheets.forEach(a => expect(a.type).toBe('worksheet'));
          lessonWithActivities.activities.readings.forEach(a => expect(a.type).toBe('reading'));
          lessonWithActivities.activities.slides.forEach(a => expect(a.type).toBe('slides'));
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * Total activities count is accurate.
   */
  test('Property 26: total activities count is accurate', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanWithActivities(),
        ({ lessonPlan, activities }) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, activities);
          
          // Total should equal sum of all groups
          const sumOfGroups = 
            lessonWithActivities.activities.quizzes.length +
            lessonWithActivities.activities.worksheets.length +
            lessonWithActivities.activities.readings.length +
            lessonWithActivities.activities.slides.length;
          
          expect(lessonWithActivities.totalActivities).toBe(sumOfGroups);
          expect(lessonWithActivities.totalActivities).toBe(activities.length);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * Empty activities list is handled correctly.
   */
  test('Property 26: empty activities list is handled', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlan(),
        (lessonPlan) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, []);
          
          expect(lessonWithActivities.totalActivities).toBe(0);
          expect(lessonWithActivities.activities.quizzes).toHaveLength(0);
          expect(lessonWithActivities.activities.worksheets).toHaveLength(0);
          expect(lessonWithActivities.activities.readings).toHaveLength(0);
          expect(lessonWithActivities.activities.slides).toHaveLength(0);
          
          // Lesson plan should still be present
          expect(lessonWithActivities.lessonPlan.id).toBe(lessonPlan.id);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * Activity IDs are unique within the result.
   */
  test('Property 26: activity IDs are unique', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanWithActivities(),
        ({ lessonPlan, activities }) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, activities);
          const allActivities = getAllActivities(lessonWithActivities);
          
          // Get all IDs
          const ids = allActivities.map(a => a.id);
          const uniqueIds = new Set(ids);
          
          // All IDs should be unique
          expect(uniqueIds.size).toBe(ids.length);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 26: Lesson Plan Retrieval Completeness**
   * **Validates: Requirements 13.3**
   * 
   * Lesson plan data is preserved in retrieval.
   */
  test('Property 26: lesson plan data is preserved', () => {
    fc.assert(
      fc.property(
        arbitraryLessonPlanWithActivities(),
        ({ lessonPlan, activities }) => {
          const lessonWithActivities = createLessonWithActivities(lessonPlan, activities);
          
          // Lesson plan should be unchanged
          expect(lessonWithActivities.lessonPlan.id).toBe(lessonPlan.id);
          expect(lessonWithActivities.lessonPlan.topic).toBe(lessonPlan.topic);
          expect(lessonWithActivities.lessonPlan.createdAt.getTime()).toBe(lessonPlan.createdAt.getTime());
          expect(lessonWithActivities.lessonPlan.updatedAt.getTime()).toBe(lessonPlan.updatedAt.getTime());
        }
      )
    );
  });
});
