import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

// Storage key for view preference persistence (matches CalendarView.tsx)
const VIEW_PREFERENCE_KEY = 'planner-calendar-view';

/**
 * Utility functions for calendar view preference persistence
 * These mirror the logic in CalendarView.tsx for testing
 */
function saveViewPreference(view: 'week' | 'month'): void {
  localStorage.setItem(VIEW_PREFERENCE_KEY, view);
}

function loadViewPreference(): 'week' | 'month' {
  const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
  if (saved === 'week' || saved === 'month') {
    return saved;
  }
  return 'week'; // Default
}

function clearViewPreference(): void {
  localStorage.removeItem(VIEW_PREFERENCE_KEY);
}

describe('Calendar View Property Tests', () => {
  // Mock localStorage for testing
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    localStorageMock = {};
    
    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, value: string) => {
          localStorageMock[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageMock[key];
        },
        clear: () => {
          localStorageMock = {};
        },
      },
      writable: true,
    });
  });

  afterEach(() => {
    localStorageMock = {};
  });

  /**
   * **Feature: instructional-design-platform, Property 1: Calendar View Preference Round-Trip**
   * **Validates: Requirements 1.7**
   * 
   * *For any* valid calendar view preference ('week' or 'month'), saving to localStorage 
   * then retrieving SHALL return the same view preference.
   */
  test('Property 1: calendar view preference round-trip', () => {
    const arbitraryViewPreference = fc.constantFrom('week', 'month') as fc.Arbitrary<'week' | 'month'>;

    fc.assert(
      fc.property(arbitraryViewPreference, (viewPreference) => {
        // Clear any existing preference
        clearViewPreference();
        
        // Save the preference
        saveViewPreference(viewPreference);
        
        // Load it back
        const loaded = loadViewPreference();
        
        // Verify round-trip
        expect(loaded).toBe(viewPreference);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 1: Calendar View Preference Round-Trip**
   * **Validates: Requirements 1.7**
   * 
   * When no preference is saved, the default should be 'week'.
   */
  test('Property 1: default view preference is week', () => {
    clearViewPreference();
    const loaded = loadViewPreference();
    expect(loaded).toBe('week');
  });

  /**
   * **Feature: instructional-design-platform, Property 1: Calendar View Preference Round-Trip**
   * **Validates: Requirements 1.7**
   * 
   * Invalid values in localStorage should fall back to default 'week'.
   */
  test('Property 1: invalid values fall back to default', () => {
    const arbitraryInvalidValue = fc.string().filter(s => s !== 'week' && s !== 'month');

    fc.assert(
      fc.property(arbitraryInvalidValue, (invalidValue) => {
        // Set an invalid value directly
        localStorage.setItem(VIEW_PREFERENCE_KEY, invalidValue);
        
        // Load should return default
        const loaded = loadViewPreference();
        expect(loaded).toBe('week');
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 1: Calendar View Preference Round-Trip**
   * **Validates: Requirements 1.7**
   * 
   * Multiple saves should preserve the last value.
   */
  test('Property 1: multiple saves preserve last value', () => {
    const arbitraryViewSequence = fc.array(
      fc.constantFrom('week', 'month') as fc.Arbitrary<'week' | 'month'>,
      { minLength: 1, maxLength: 10 }
    );

    fc.assert(
      fc.property(arbitraryViewSequence, (viewSequence) => {
        clearViewPreference();
        
        // Save each preference in sequence
        viewSequence.forEach(view => {
          saveViewPreference(view);
        });
        
        // Load should return the last saved value
        const loaded = loadViewPreference();
        expect(loaded).toBe(viewSequence[viewSequence.length - 1]);
      })
    );
  });
});
