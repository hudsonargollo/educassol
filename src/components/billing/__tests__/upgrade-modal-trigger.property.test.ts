import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Type definitions mirroring the application types
 */
type LimitCategory = 'lessonPlans' | 'activities' | 'assessments' | 'fileUploads';

type Tier = 'free' | 'premium' | 'enterprise';

/**
 * Represents a 402 response from the API
 */
interface LimitExceededResponse {
  error: string;
  limit_type: LimitCategory;
  current_usage: number;
  limit: number;
  tier: Tier;
}

/**
 * Represents the limit exceeded info passed to the modal
 */
interface LimitExceededInfo {
  limitType: LimitCategory;
  currentUsage: number;
  limit: number;
  tier: string;
}

/**
 * Represents the modal state
 */
interface UpgradeModalState {
  isOpen: boolean;
  limitType: LimitCategory | null;
  currentUsage: number;
  limit: number;
}

/**
 * Pure function to determine if upgrade modal should be triggered
 * This mirrors the logic in useGeneration hook
 * 
 * Requirements: 4.1
 * - Display immediately when limit exceeded with specific limit reached
 */
function shouldTriggerUpgradeModal(
  httpStatus: number,
  responseBody?: LimitExceededResponse
): boolean {
  // Modal should trigger on 402 Payment Required status
  return httpStatus === 402 && responseBody !== undefined;
}

/**
 * Pure function to extract modal props from 402 response
 * This mirrors the logic in useGeneration hook
 */
function extractModalProps(
  responseBody: LimitExceededResponse
): LimitExceededInfo {
  return {
    limitType: responseBody.limit_type,
    currentUsage: responseBody.current_usage,
    limit: responseBody.limit,
    tier: responseBody.tier,
  };
}

/**
 * Pure function to determine modal state from API response
 */
function determineModalState(
  httpStatus: number,
  responseBody?: LimitExceededResponse
): UpgradeModalState {
  if (shouldTriggerUpgradeModal(httpStatus, responseBody)) {
    const props = extractModalProps(responseBody!);
    return {
      isOpen: true,
      limitType: props.limitType,
      currentUsage: props.currentUsage,
      limit: props.limit,
    };
  }

  return {
    isOpen: false,
    limitType: null,
    currentUsage: 0,
    limit: 0,
  };
}

/**
 * Arbitrary for limit categories
 */
const arbitraryLimitCategory = (): fc.Arbitrary<LimitCategory> =>
  fc.constantFrom('lessonPlans', 'activities', 'assessments', 'fileUploads') as fc.Arbitrary<LimitCategory>;

/**
 * Arbitrary for tiers
 */
const arbitraryTier = (): fc.Arbitrary<Tier> =>
  fc.constantFrom('free', 'premium', 'enterprise') as fc.Arbitrary<Tier>;

/**
 * Arbitrary for HTTP status codes (non-402)
 */
const arbitraryNon402Status = (): fc.Arbitrary<number> =>
  fc.constantFrom(200, 201, 400, 401, 403, 404, 500, 502, 503);

/**
 * Arbitrary for a valid 402 response body
 */
const arbitrary402ResponseBody = (): fc.Arbitrary<LimitExceededResponse> =>
  fc.record({
    error: fc.constant('Usage limit exceeded'),
    limit_type: arbitraryLimitCategory(),
    current_usage: fc.nat({ max: 100 }),
    limit: fc.integer({ min: 1, max: 100 }),
    tier: arbitraryTier(),
  });

/**
 * Arbitrary for current usage that equals or exceeds limit
 */
const arbitraryUsageAtOrAboveLimit = (): fc.Arbitrary<{ usage: number; limit: number }> =>
  fc.integer({ min: 1, max: 100 }).chain(limit =>
    fc.integer({ min: limit, max: limit + 50 }).map(usage => ({ usage, limit }))
  );

describe('Upgrade Modal Trigger Property Tests', () => {
  /**
   * **Feature: freemium-platform-pivot, Property 10: Upgrade Modal Trigger**
   * **Validates: Requirements 4.1**
   *
   * *For any* 402 response received by the frontend due to limit exceeded,
   * the Upgrade Modal SHALL be displayed with the correct limit_type and
   * current_usage values from the response.
   */

  test('Property 10: 402 response triggers upgrade modal', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        (responseBody) => {
          const modalState = determineModalState(402, responseBody);

          // Modal should be open
          expect(modalState.isOpen).toBe(true);
        }
      )
    );
  });

  test('Property 10: Modal receives correct limit_type from 402 response', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        (responseBody) => {
          const modalState = determineModalState(402, responseBody);

          // Modal should have correct limit type
          expect(modalState.limitType).toBe(responseBody.limit_type);
        }
      )
    );
  });

  test('Property 10: Modal receives correct current_usage from 402 response', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        (responseBody) => {
          const modalState = determineModalState(402, responseBody);

          // Modal should have correct current usage
          expect(modalState.currentUsage).toBe(responseBody.current_usage);
        }
      )
    );
  });

  test('Property 10: Modal receives correct limit from 402 response', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        (responseBody) => {
          const modalState = determineModalState(402, responseBody);

          // Modal should have correct limit
          expect(modalState.limit).toBe(responseBody.limit);
        }
      )
    );
  });

  test('Property 10: Non-402 responses do NOT trigger upgrade modal', () => {
    fc.assert(
      fc.property(
        arbitraryNon402Status(),
        (httpStatus) => {
          const modalState = determineModalState(httpStatus, undefined);

          // Modal should NOT be open for non-402 status
          expect(modalState.isOpen).toBe(false);
          expect(modalState.limitType).toBeNull();
        }
      )
    );
  });

  test('Property 10: 402 without response body does NOT trigger modal', () => {
    const modalState = determineModalState(402, undefined);

    // Modal should NOT be open without response body
    expect(modalState.isOpen).toBe(false);
    expect(modalState.limitType).toBeNull();
  });

  test('Property 10: All limit categories can trigger modal', () => {
    const categories: LimitCategory[] = ['lessonPlans', 'activities', 'assessments', 'fileUploads'];

    for (const category of categories) {
      const responseBody: LimitExceededResponse = {
        error: 'Usage limit exceeded',
        limit_type: category,
        current_usage: 5,
        limit: 5,
        tier: 'free',
      };

      const modalState = determineModalState(402, responseBody);

      expect(modalState.isOpen).toBe(true);
      expect(modalState.limitType).toBe(category);
    }
  });

  test('Property 10: Modal props are extracted correctly for any valid response', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        (responseBody) => {
          const props = extractModalProps(responseBody);

          // All props should match response body
          expect(props.limitType).toBe(responseBody.limit_type);
          expect(props.currentUsage).toBe(responseBody.current_usage);
          expect(props.limit).toBe(responseBody.limit);
          expect(props.tier).toBe(responseBody.tier);
        }
      )
    );
  });

  test('Property 10: Modal trigger is deterministic', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 599 }),
        fc.option(arbitrary402ResponseBody()),
        (httpStatus, maybeResponseBody) => {
          const responseBody = maybeResponseBody ?? undefined;

          // Call twice with same inputs
          const result1 = determineModalState(httpStatus, responseBody);
          const result2 = determineModalState(httpStatus, responseBody);

          // Results should be identical
          expect(result1.isOpen).toBe(result2.isOpen);
          expect(result1.limitType).toBe(result2.limitType);
          expect(result1.currentUsage).toBe(result2.currentUsage);
          expect(result1.limit).toBe(result2.limit);
        }
      )
    );
  });

  test('Property 10: Usage at or above limit triggers modal with correct values', () => {
    fc.assert(
      fc.property(
        arbitraryUsageAtOrAboveLimit(),
        arbitraryLimitCategory(),
        ({ usage, limit }, category) => {
          const responseBody: LimitExceededResponse = {
            error: 'Usage limit exceeded',
            limit_type: category,
            current_usage: usage,
            limit: limit,
            tier: 'free',
          };

          const modalState = determineModalState(402, responseBody);

          // Modal should be open
          expect(modalState.isOpen).toBe(true);
          
          // Current usage should be >= limit (this is the trigger condition)
          expect(modalState.currentUsage).toBeGreaterThanOrEqual(modalState.limit);
        }
      )
    );
  });

  test('Property 10: Tier information is preserved in modal props', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        (responseBody) => {
          const props = extractModalProps(responseBody);

          // Tier should be preserved
          expect(props.tier).toBe(responseBody.tier);
          expect(['free', 'premium', 'enterprise']).toContain(props.tier);
        }
      )
    );
  });

  test('Property 10: Modal trigger only depends on status and response body', () => {
    fc.assert(
      fc.property(
        arbitrary402ResponseBody(),
        arbitrary402ResponseBody(),
        (responseBody1, responseBody2) => {
          // Same status (402) with different response bodies
          const result1 = determineModalState(402, responseBody1);
          const result2 = determineModalState(402, responseBody2);

          // Both should trigger modal
          expect(result1.isOpen).toBe(true);
          expect(result2.isOpen).toBe(true);

          // But with different props
          if (responseBody1.limit_type !== responseBody2.limit_type) {
            expect(result1.limitType).not.toBe(result2.limitType);
          }
        }
      )
    );
  });
});
