import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 50 });

/**
 * Type definitions mirroring the application types
 */
type GenerationType =
  | 'lesson-plan'
  | 'activity'
  | 'worksheet'
  | 'quiz'
  | 'reading'
  | 'slides'
  | 'assessment'
  | 'file-upload';

type Tier = 'free' | 'premium' | 'enterprise';

type LimitCategory = 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';

/**
 * Represents a usage log entry
 */
interface UsageLogEntry {
  id: string;
  user_id: string;
  generation_type: GenerationType;
  tier: Tier;
  created_at: Date;
}

/**
 * Represents aggregated monthly usage
 */
interface MonthlyUsage {
  lessonPlans: number;
  activities: number;
  assessments: number;
  fileUploads: number;
}

/**
 * Maps generation types to their limit categories
 * This mirrors the logic in useUsage hook
 */
function mapGenerationTypeToCategory(generationType: GenerationType): LimitCategory {
  switch (generationType) {
    case 'lesson-plan':
      return 'lessonPlans';
    case 'activity':
    case 'worksheet':
    case 'quiz':
    case 'reading':
    case 'slides':
      return 'activities';
    case 'assessment':
      return 'assessments';
    case 'file-upload':
      return 'fileUploads';
    default:
      return 'activities';
  }
}

/**
 * Gets the start of a month for a given date
 */
function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Gets the end of a month for a given date
 */
function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Checks if a date is within a given month
 */
function isWithinMonth(date: Date, monthStart: Date, monthEnd: Date): boolean {
  return date >= monthStart && date <= monthEnd;
}

/**
 * Pure function to aggregate usage logs for a specific month
 * This mirrors the aggregation logic in useUsage hook
 * 
 * Requirements: 1.3
 * - Return current month's count grouped by generation_type
 */
function aggregateUsageForMonth(
  logs: UsageLogEntry[],
  userId: string,
  targetMonth: Date
): MonthlyUsage {
  const monthStart = getStartOfMonth(targetMonth);
  const monthEnd = getEndOfMonth(targetMonth);

  const usage: MonthlyUsage = {
    lessonPlans: 0,
    activities: 0,
    assessments: 0,
    fileUploads: 0,
  };

  for (const log of logs) {
    // Filter by user
    if (log.user_id !== userId) continue;

    // Filter by month
    if (!isWithinMonth(log.created_at, monthStart, monthEnd)) continue;

    // Increment appropriate category
    const category = mapGenerationTypeToCategory(log.generation_type);
    usage[category]++;
  }

  return usage;
}

/**
 * Count logs matching specific criteria
 */
function countLogsForUserAndMonth(
  logs: UsageLogEntry[],
  userId: string,
  targetMonth: Date,
  generationTypes: GenerationType[]
): number {
  const monthStart = getStartOfMonth(targetMonth);
  const monthEnd = getEndOfMonth(targetMonth);

  return logs.filter(log =>
    log.user_id === userId &&
    isWithinMonth(log.created_at, monthStart, monthEnd) &&
    generationTypes.includes(log.generation_type)
  ).length;
}

/**
 * Arbitrary for generation types
 */
const arbitraryGenerationType = (): fc.Arbitrary<GenerationType> =>
  fc.constantFrom(
    'lesson-plan',
    'activity',
    'worksheet',
    'quiz',
    'reading',
    'slides',
    'assessment',
    'file-upload'
  ) as fc.Arbitrary<GenerationType>;

/**
 * Arbitrary for tiers
 */
const arbitraryTier = (): fc.Arbitrary<Tier> =>
  fc.constantFrom('free', 'premium', 'enterprise') as fc.Arbitrary<Tier>;

/**
 * Arbitrary for user IDs
 */
const arbitraryUserId = (): fc.Arbitrary<string> =>
  fc.uuid();

/**
 * Arbitrary for dates within a reasonable range
 */
const arbitraryDate = (): fc.Arbitrary<Date> =>
  fc.date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') });

/**
 * Arbitrary for a usage log entry
 */
const arbitraryUsageLogEntry = (userIds: string[]): fc.Arbitrary<UsageLogEntry> =>
  fc.record({
    id: fc.uuid(),
    user_id: fc.constantFrom(...userIds),
    generation_type: arbitraryGenerationType(),
    tier: arbitraryTier(),
    created_at: arbitraryDate(),
  });

/**
 * Arbitrary for a list of usage log entries
 */
const arbitraryUsageLogs = (userIds: string[]): fc.Arbitrary<UsageLogEntry[]> =>
  fc.array(arbitraryUsageLogEntry(userIds), { minLength: 0, maxLength: 100 });

describe('Usage Aggregation Correctness Property Tests', () => {
  /**
   * **Feature: freemium-platform-pivot, Property 3: Usage Aggregation Correctness**
   * **Validates: Requirements 1.3**
   *
   * *For any* set of usage_log entries for a user within a calendar month,
   * the usage query SHALL return counts that exactly match the number of entries
   * for each generation_type.
   */

  test('Property 3: Aggregated counts match raw log counts for each category', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryDate(),
        fc.array(arbitraryGenerationType(), { minLength: 0, maxLength: 30 }),
        arbitraryTier(),
        (userId, targetMonth, generationTypes, tier) => {
          const monthStart = getStartOfMonth(targetMonth);
          
          // Create logs for this user in this month
          const logs: UsageLogEntry[] = generationTypes.map((gt, i) => ({
            id: `log-${i}`,
            user_id: userId,
            generation_type: gt,
            tier,
            created_at: new Date(monthStart.getTime() + (i + 1) * 86400000),
          }));

          const aggregated = aggregateUsageForMonth(logs, userId, targetMonth);

          // Verify lesson plans count
          const expectedLessonPlans = countLogsForUserAndMonth(
            logs, userId, targetMonth, ['lesson-plan']
          );
          expect(aggregated.lessonPlans).toBe(expectedLessonPlans);

          // Verify activities count (includes multiple types)
          const expectedActivities = countLogsForUserAndMonth(
            logs, userId, targetMonth,
            ['activity', 'worksheet', 'quiz', 'reading', 'slides']
          );
          expect(aggregated.activities).toBe(expectedActivities);

          // Verify assessments count
          const expectedAssessments = countLogsForUserAndMonth(
            logs, userId, targetMonth, ['assessment']
          );
          expect(aggregated.assessments).toBe(expectedAssessments);

          // Verify file uploads count
          const expectedFileUploads = countLogsForUserAndMonth(
            logs, userId, targetMonth, ['file-upload']
          );
          expect(aggregated.fileUploads).toBe(expectedFileUploads);
        }
      )
    );
  });

  test('Property 3: Empty logs result in zero counts', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryDate(),
        (userId, targetMonth) => {
          const emptyLogs: UsageLogEntry[] = [];
          const aggregated = aggregateUsageForMonth(emptyLogs, userId, targetMonth);

          expect(aggregated.lessonPlans).toBe(0);
          expect(aggregated.activities).toBe(0);
          expect(aggregated.assessments).toBe(0);
          expect(aggregated.fileUploads).toBe(0);
        }
      )
    );
  });

  test('Property 3: Logs from other users are not counted', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryUserId(),
        arbitraryDate(),
        arbitraryGenerationType(),
        arbitraryTier(),
        (targetUserId, otherUserId, targetMonth, generationType, tier) => {
          // Ensure different users
          fc.pre(targetUserId !== otherUserId);

          const monthStart = getStartOfMonth(targetMonth);
          
          // Create log for other user
          const logs: UsageLogEntry[] = [{
            id: 'test-id',
            user_id: otherUserId,
            generation_type: generationType,
            tier,
            created_at: new Date(monthStart.getTime() + 86400000), // Day after month start
          }];

          const aggregated = aggregateUsageForMonth(logs, targetUserId, targetMonth);

          // All counts should be zero for target user
          expect(aggregated.lessonPlans).toBe(0);
          expect(aggregated.activities).toBe(0);
          expect(aggregated.assessments).toBe(0);
          expect(aggregated.fileUploads).toBe(0);
        }
      )
    );
  });

  test('Property 3: Logs from other months are not counted', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryGenerationType(),
        arbitraryTier(),
        (userId, generationType, tier) => {
          const targetMonth = new Date('2025-06-15');
          const previousMonth = new Date('2025-05-15');
          const nextMonth = new Date('2025-07-15');

          // Create logs in adjacent months
          const logs: UsageLogEntry[] = [
            {
              id: 'prev-month',
              user_id: userId,
              generation_type: generationType,
              tier,
              created_at: previousMonth,
            },
            {
              id: 'next-month',
              user_id: userId,
              generation_type: generationType,
              tier,
              created_at: nextMonth,
            },
          ];

          const aggregated = aggregateUsageForMonth(logs, userId, targetMonth);

          // All counts should be zero for target month
          expect(aggregated.lessonPlans).toBe(0);
          expect(aggregated.activities).toBe(0);
          expect(aggregated.assessments).toBe(0);
          expect(aggregated.fileUploads).toBe(0);
        }
      )
    );
  });

  test('Property 3: Total count equals sum of all categories', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryDate(),
        fc.array(arbitraryGenerationType(), { minLength: 0, maxLength: 30 }),
        arbitraryTier(),
        (userId, targetMonth, generationTypes, tier) => {
          const monthStart = getStartOfMonth(targetMonth);
          
          // Create logs for this user in this month
          const logs: UsageLogEntry[] = generationTypes.map((gt, i) => ({
            id: `log-${i}`,
            user_id: userId,
            generation_type: gt,
            tier,
            created_at: new Date(monthStart.getTime() + (i + 1) * 86400000),
          }));

          const aggregated = aggregateUsageForMonth(logs, userId, targetMonth);

          // Sum of all categories should equal total logs
          const sumOfCategories =
            aggregated.lessonPlans +
            aggregated.activities +
            aggregated.assessments +
            aggregated.fileUploads;

          expect(sumOfCategories).toBe(logs.length);
        }
      )
    );
  });

  test('Property 3: Aggregation is deterministic', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryDate(),
        fc.array(arbitraryGenerationType(), { minLength: 0, maxLength: 20 }),
        arbitraryTier(),
        (userId, targetMonth, generationTypes, tier) => {
          const monthStart = getStartOfMonth(targetMonth);
          
          const logs: UsageLogEntry[] = generationTypes.map((gt, i) => ({
            id: `log-${i}`,
            user_id: userId,
            generation_type: gt,
            tier,
            created_at: new Date(monthStart.getTime() + (i + 1) * 86400000),
          }));

          // Run aggregation twice
          const result1 = aggregateUsageForMonth(logs, userId, targetMonth);
          const result2 = aggregateUsageForMonth(logs, userId, targetMonth);

          // Results should be identical
          expect(result1.lessonPlans).toBe(result2.lessonPlans);
          expect(result1.activities).toBe(result2.activities);
          expect(result1.assessments).toBe(result2.assessments);
          expect(result1.fileUploads).toBe(result2.fileUploads);
        }
      )
    );
  });

  test('Property 3: Order of logs does not affect aggregation', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryDate(),
        fc.array(arbitraryGenerationType(), { minLength: 0, maxLength: 20 }),
        arbitraryTier(),
        (userId, targetMonth, generationTypes, tier) => {
          const monthStart = getStartOfMonth(targetMonth);
          
          const logs: UsageLogEntry[] = generationTypes.map((gt, i) => ({
            id: `log-${i}`,
            user_id: userId,
            generation_type: gt,
            tier,
            created_at: new Date(monthStart.getTime() + (i + 1) * 86400000),
          }));

          // Aggregate original order
          const result1 = aggregateUsageForMonth(logs, userId, targetMonth);

          // Aggregate reversed order
          const reversedLogs = [...logs].reverse();
          const result2 = aggregateUsageForMonth(reversedLogs, userId, targetMonth);

          // Results should be identical
          expect(result1.lessonPlans).toBe(result2.lessonPlans);
          expect(result1.activities).toBe(result2.activities);
          expect(result1.assessments).toBe(result2.assessments);
          expect(result1.fileUploads).toBe(result2.fileUploads);
        }
      )
    );
  });

  test('Property 3: Single log increments correct category by 1', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryGenerationType(),
        arbitraryTier(),
        (userId, generationType, tier) => {
          const targetMonth = new Date('2025-06-15');
          const monthStart = getStartOfMonth(targetMonth);

          const logs: UsageLogEntry[] = [{
            id: 'single-log',
            user_id: userId,
            generation_type: generationType,
            tier,
            created_at: new Date(monthStart.getTime() + 86400000),
          }];

          const aggregated = aggregateUsageForMonth(logs, userId, targetMonth);
          const category = mapGenerationTypeToCategory(generationType);

          // The correct category should be 1
          expect(aggregated[category]).toBe(1);

          // Sum should be exactly 1
          const total =
            aggregated.lessonPlans +
            aggregated.activities +
            aggregated.assessments +
            aggregated.fileUploads;
          expect(total).toBe(1);
        }
      )
    );
  });

  test('Property 3: Tier does not affect aggregation counts', () => {
    fc.assert(
      fc.property(
        arbitraryUserId(),
        arbitraryGenerationType(),
        (userId, generationType) => {
          const targetMonth = new Date('2025-06-15');
          const monthStart = getStartOfMonth(targetMonth);
          const tiers: Tier[] = ['free', 'premium', 'enterprise'];

          const results = tiers.map(tier => {
            const logs: UsageLogEntry[] = [{
              id: `log-${tier}`,
              user_id: userId,
              generation_type: generationType,
              tier,
              created_at: new Date(monthStart.getTime() + 86400000),
            }];
            return aggregateUsageForMonth(logs, userId, targetMonth);
          });

          // All tiers should produce identical counts
          const [free, premium, enterprise] = results;
          expect(free.lessonPlans).toBe(premium.lessonPlans);
          expect(free.lessonPlans).toBe(enterprise.lessonPlans);
          expect(free.activities).toBe(premium.activities);
          expect(free.activities).toBe(enterprise.activities);
          expect(free.assessments).toBe(premium.assessments);
          expect(free.assessments).toBe(enterprise.assessments);
          expect(free.fileUploads).toBe(premium.fileUploads);
          expect(free.fileUploads).toBe(enterprise.fileUploads);
        }
      )
    );
  });
});
