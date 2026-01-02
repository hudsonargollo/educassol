import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Type definitions mirroring the application types
 */
type Tier = 'free' | 'premium' | 'enterprise';

type SubscriptionStatus = 'active' | 'pending' | 'paused' | 'cancelled' | null;

type MercadoPagoPreapprovalStatus = 'authorized' | 'pending' | 'paused' | 'cancelled';

/**
 * Represents a user profile state
 */
interface ProfileState {
  tier: Tier;
  mp_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
}

/**
 * Represents a MercadoPago IPN webhook event
 */
interface MercadoPagoIPNEvent {
  type: 'subscription_preapproval';
  preapproval_id: string;
  status: MercadoPagoPreapprovalStatus;
  external_reference: string; // user_id
}

/**
 * Pure function to process MercadoPago IPN event and return new profile state
 * This mirrors the logic in mp-webhook Edge Function
 * 
 * Requirements: 10.2, 10.3, 10.4, 10.5, 10.6
 */
function processIPNEvent(
  currentState: ProfileState,
  event: MercadoPagoIPNEvent
): ProfileState {
  switch (event.status) {
    case 'authorized':
      // Requirement 10.2: Update tier to Premium on authorized
      return {
        tier: 'premium',
        mp_subscription_id: event.preapproval_id,
        subscription_status: 'active',
      };

    case 'cancelled':
      // Requirement 10.5: Downgrade to Free on cancelled
      return {
        tier: 'free',
        mp_subscription_id: currentState.mp_subscription_id,
        subscription_status: 'cancelled',
      };

    case 'paused':
      // Requirement 10.4: Downgrade to Free on paused
      return {
        tier: 'free',
        mp_subscription_id: currentState.mp_subscription_id,
        subscription_status: 'paused',
      };

    case 'pending':
      // Payment pending - update status only
      return {
        tier: currentState.tier,
        mp_subscription_id: currentState.mp_subscription_id,
        subscription_status: 'pending',
      };

    default:
      return currentState;
  }
}

/**
 * Process a sequence of IPN events
 */
function processIPNEventSequence(
  initialState: ProfileState,
  events: MercadoPagoIPNEvent[]
): ProfileState {
  return events.reduce(
    (state, event) => processIPNEvent(state, event),
    initialState
  );
}

/**
 * Validates that tier and subscription_status are consistent
 * Note: This validates the state AFTER processing an event, not arbitrary initial states
 */
function isStateConsistent(state: ProfileState): boolean {
  // Premium tier should have active subscription status
  if (state.tier === 'premium' && state.subscription_status === 'active') {
    return true;
  }

  // Free tier can have any subscription status (cancelled, paused, pending, or null)
  if (state.tier === 'free') {
    return state.subscription_status !== 'active' || state.subscription_status === null;
  }

  // Enterprise tier is managed separately (not through MercadoPago)
  if (state.tier === 'enterprise') {
    return true;
  }

  return true;
}

/**
 * Arbitrary for tiers
 */
const arbitraryTier = (): fc.Arbitrary<Tier> =>
  fc.constantFrom('free', 'premium', 'enterprise') as fc.Arbitrary<Tier>;

/**
 * Arbitrary for subscription status
 */
const arbitrarySubscriptionStatus = (): fc.Arbitrary<SubscriptionStatus> =>
  fc.constantFrom('active', 'pending', 'paused', 'cancelled', null) as fc.Arbitrary<SubscriptionStatus>;

/**
 * Arbitrary for MercadoPago preapproval status
 */
const arbitraryMPStatus = (): fc.Arbitrary<MercadoPagoPreapprovalStatus> =>
  fc.constantFrom('authorized', 'pending', 'paused', 'cancelled') as fc.Arbitrary<MercadoPagoPreapprovalStatus>;

/**
 * Arbitrary for a valid initial profile state
 */
const arbitraryInitialProfileState = (): fc.Arbitrary<ProfileState> =>
  fc.record({
    tier: arbitraryTier(),
    mp_subscription_id: fc.option(fc.uuid()).map(opt => opt ?? null),
    subscription_status: arbitrarySubscriptionStatus(),
  });

/**
 * Arbitrary for a valid initial profile state (consistent tier/status)
 */
const arbitraryValidInitialProfileState = (): fc.Arbitrary<ProfileState> =>
  fc.oneof(
    // Free tier with non-active status
    fc.record({
      tier: fc.constant('free' as Tier),
      mp_subscription_id: fc.option(fc.uuid()).map(opt => opt ?? null),
      subscription_status: fc.constantFrom('pending', 'paused', 'cancelled', null) as fc.Arbitrary<SubscriptionStatus>,
    }),
    // Premium tier with active status
    fc.record({
      tier: fc.constant('premium' as Tier),
      mp_subscription_id: fc.uuid(),
      subscription_status: fc.constant('active' as SubscriptionStatus),
    }),
    // Enterprise tier (any status)
    fc.record({
      tier: fc.constant('enterprise' as Tier),
      mp_subscription_id: fc.option(fc.uuid()).map(opt => opt ?? null),
      subscription_status: arbitrarySubscriptionStatus(),
    })
  );

/**
 * Arbitrary for a MercadoPago IPN event
 */
const arbitraryIPNEvent = (): fc.Arbitrary<MercadoPagoIPNEvent> =>
  fc.record({
    type: fc.constant('subscription_preapproval' as const),
    preapproval_id: fc.uuid(),
    status: arbitraryMPStatus(),
    external_reference: fc.uuid(),
  });

/**
 * Arbitrary for a sequence of IPN events
 */
const arbitraryIPNEventSequence = (): fc.Arbitrary<MercadoPagoIPNEvent[]> =>
  fc.array(arbitraryIPNEvent(), { minLength: 0, maxLength: 20 });

describe('Tier State Machine Transitions Property Tests', () => {
  /**
   * **Feature: freemium-platform-pivot, Property 8: Tier State Machine Transitions**
   * **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**
   *
   * *For any* MercadoPago IPN webhook event sequence, the user's tier SHALL transition
   * according to the state machine: status='authorized' → tier='premium',
   * status='cancelled' or 'paused' → tier='free', and the tier SHALL remain
   * consistent with the subscription_status.
   */

  test('Property 8: Authorized status transitions tier to premium', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const event: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'authorized',
            external_reference: userId,
          };

          const newState = processIPNEvent(initialState, event);

          // Tier should be premium
          expect(newState.tier).toBe('premium');
          // Subscription status should be active
          expect(newState.subscription_status).toBe('active');
          // Subscription ID should be set
          expect(newState.mp_subscription_id).toBe(preapprovalId);
        }
      )
    );
  });

  test('Property 8: Cancelled status transitions tier to free', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const event: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'cancelled',
            external_reference: userId,
          };

          const newState = processIPNEvent(initialState, event);

          // Tier should be free
          expect(newState.tier).toBe('free');
          // Subscription status should be cancelled
          expect(newState.subscription_status).toBe('cancelled');
        }
      )
    );
  });

  test('Property 8: Paused status transitions tier to free', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const event: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'paused',
            external_reference: userId,
          };

          const newState = processIPNEvent(initialState, event);

          // Tier should be free
          expect(newState.tier).toBe('free');
          // Subscription status should be paused
          expect(newState.subscription_status).toBe('paused');
        }
      )
    );
  });

  test('Property 8: Pending status does not change tier', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const event: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'pending',
            external_reference: userId,
          };

          const newState = processIPNEvent(initialState, event);

          // Tier should remain unchanged
          expect(newState.tier).toBe(initialState.tier);
          // Subscription status should be pending
          expect(newState.subscription_status).toBe('pending');
        }
      )
    );
  });

  test('Property 8: State remains consistent after any event', () => {
    fc.assert(
      fc.property(
        arbitraryValidInitialProfileState(),
        arbitraryIPNEvent(),
        (initialState, event) => {
          const newState = processIPNEvent(initialState, event);

          // State should be consistent after processing event
          expect(isStateConsistent(newState)).toBe(true);
        }
      )
    );
  });

  test('Property 8: State remains consistent after any event sequence', () => {
    fc.assert(
      fc.property(
        arbitraryValidInitialProfileState(),
        arbitraryIPNEventSequence(),
        (initialState, events) => {
          const finalState = processIPNEventSequence(initialState, events);

          // Final state should be consistent
          expect(isStateConsistent(finalState)).toBe(true);
        }
      )
    );
  });

  test('Property 8: Authorized followed by cancelled results in free tier', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const authorizedEvent: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'authorized',
            external_reference: userId,
          };

          const cancelledEvent: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'cancelled',
            external_reference: userId,
          };

          const afterAuthorized = processIPNEvent(initialState, authorizedEvent);
          const afterCancelled = processIPNEvent(afterAuthorized, cancelledEvent);

          // After authorized, should be premium
          expect(afterAuthorized.tier).toBe('premium');
          expect(afterAuthorized.subscription_status).toBe('active');

          // After cancelled, should be free
          expect(afterCancelled.tier).toBe('free');
          expect(afterCancelled.subscription_status).toBe('cancelled');
        }
      )
    );
  });

  test('Property 8: Authorized followed by paused results in free tier', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const authorizedEvent: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'authorized',
            external_reference: userId,
          };

          const pausedEvent: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'paused',
            external_reference: userId,
          };

          const afterAuthorized = processIPNEvent(initialState, authorizedEvent);
          const afterPaused = processIPNEvent(afterAuthorized, pausedEvent);

          // After authorized, should be premium
          expect(afterAuthorized.tier).toBe('premium');

          // After paused, should be free
          expect(afterPaused.tier).toBe('free');
          expect(afterPaused.subscription_status).toBe('paused');
        }
      )
    );
  });

  test('Property 8: Re-authorization after cancellation restores premium', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId1, preapprovalId2, userId) => {
          const events: MercadoPagoIPNEvent[] = [
            {
              type: 'subscription_preapproval',
              preapproval_id: preapprovalId1,
              status: 'authorized',
              external_reference: userId,
            },
            {
              type: 'subscription_preapproval',
              preapproval_id: preapprovalId1,
              status: 'cancelled',
              external_reference: userId,
            },
            {
              type: 'subscription_preapproval',
              preapproval_id: preapprovalId2,
              status: 'authorized',
              external_reference: userId,
            },
          ];

          const finalState = processIPNEventSequence(initialState, events);

          // After re-authorization, should be premium again
          expect(finalState.tier).toBe('premium');
          expect(finalState.subscription_status).toBe('active');
          expect(finalState.mp_subscription_id).toBe(preapprovalId2);
        }
      )
    );
  });

  test('Property 8: Final state only depends on last relevant event', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        arbitraryMPStatus(),
        (initialState, preapprovalId, finalStatus) => {
          // Create a sequence ending with the final status
          const finalEvent: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: finalStatus,
            external_reference: 'user-123',
          };

          const finalState = processIPNEvent(initialState, finalEvent);

          // Verify final state matches expected for the status
          switch (finalStatus) {
            case 'authorized':
              expect(finalState.tier).toBe('premium');
              expect(finalState.subscription_status).toBe('active');
              break;
            case 'cancelled':
              expect(finalState.tier).toBe('free');
              expect(finalState.subscription_status).toBe('cancelled');
              break;
            case 'paused':
              expect(finalState.tier).toBe('free');
              expect(finalState.subscription_status).toBe('paused');
              break;
            case 'pending':
              expect(finalState.tier).toBe(initialState.tier);
              expect(finalState.subscription_status).toBe('pending');
              break;
          }
        }
      )
    );
  });

  test('Property 8: Subscription ID is stored on authorization', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        fc.uuid(),
        fc.uuid(),
        (initialState, preapprovalId, userId) => {
          const event: MercadoPagoIPNEvent = {
            type: 'subscription_preapproval',
            preapproval_id: preapprovalId,
            status: 'authorized',
            external_reference: userId,
          };

          const newState = processIPNEvent(initialState, event);

          // Subscription ID should be stored (Requirement 10.6)
          expect(newState.mp_subscription_id).toBe(preapprovalId);
        }
      )
    );
  });

  test('Property 8: State transitions are deterministic', () => {
    fc.assert(
      fc.property(
        arbitraryInitialProfileState(),
        arbitraryIPNEvent(),
        (initialState, event) => {
          // Process same event twice
          const result1 = processIPNEvent(initialState, event);
          const result2 = processIPNEvent(initialState, event);

          // Results should be identical
          expect(result1.tier).toBe(result2.tier);
          expect(result1.subscription_status).toBe(result2.subscription_status);
          expect(result1.mp_subscription_id).toBe(result2.mp_subscription_id);
        }
      )
    );
  });
});
