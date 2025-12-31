import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * LocalStorage key for panel proportions (matches GradingWorkstation)
 */
const PANEL_STORAGE_KEY = 'educassol-grading-panel-sizes';

/**
 * Default panel sizes (percentages)
 */
const DEFAULT_PANEL_SIZES = [50, 50];

/**
 * Load panel sizes from localStorage
 * (Extracted from GradingWorkstation for testing)
 */
function loadPanelSizes(storage: Storage): number[] {
  try {
    const stored = storage.getItem(PANEL_STORAGE_KEY);
    if (stored) {
      const sizes = JSON.parse(stored);
      if (Array.isArray(sizes) && sizes.length === 2) {
        // Validate sizes are within bounds
        const [left, right] = sizes;
        if (left >= 10 && left <= 90 && right >= 10 && right <= 90) {
          return sizes;
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PANEL_SIZES;
}

/**
 * Save panel sizes to localStorage
 * (Extracted from GradingWorkstation for testing)
 */
function savePanelSizes(storage: Storage, sizes: number[]): void {
  try {
    storage.setItem(PANEL_STORAGE_KEY, JSON.stringify(sizes));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Create a mock storage for testing
 */
function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
  };
}

describe('Panel Proportion Persistence Property Tests', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockStorage();
  });

  /**
   * **Feature: magic-grading-engine, Property 10: Panel Proportion Persistence Round-Trip**
   * **Validates: Requirements 8.2**
   * 
   * *For any* valid panel proportion value (between 0.1 and 0.9), saving to localStorage 
   * then retrieving SHALL return the same proportion value.
   */
  test('Property 10: valid panel proportions round-trip correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 90 }),
        (leftSize) => {
          const rightSize = 100 - leftSize;
          const sizes = [leftSize, rightSize];
          
          // Save to storage
          savePanelSizes(mockStorage, sizes);
          
          // Load from storage
          const loaded = loadPanelSizes(mockStorage);
          
          // Verify round-trip preserves values
          expect(loaded).toEqual(sizes);
          expect(loaded[0]).toBe(leftSize);
          expect(loaded[1]).toBe(rightSize);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 10: Panel Proportion Persistence Round-Trip**
   * **Validates: Requirements 8.2**
   * 
   * Panel sizes outside valid bounds (10-90) should return defaults.
   */
  test('Property 10: invalid panel sizes return defaults', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Left size too small
          fc.integer({ min: 0, max: 9 }).map(left => [left, 100 - left]),
          // Left size too large
          fc.integer({ min: 91, max: 100 }).map(left => [left, 100 - left]),
        ),
        (invalidSizes) => {
          // Save invalid sizes
          mockStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(invalidSizes));
          
          // Load should return defaults
          const loaded = loadPanelSizes(mockStorage);
          expect(loaded).toEqual(DEFAULT_PANEL_SIZES);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 10: Panel Proportion Persistence Round-Trip**
   * **Validates: Requirements 8.2**
   * 
   * Non-array values in storage should return defaults.
   */
  test('Property 10: non-array values return defaults', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 0, maxLength: 50 }),
          fc.integer(),
          fc.boolean(),
          fc.constant(null),
        ),
        (nonArrayValue) => {
          // Save non-array value
          mockStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(nonArrayValue));
          
          // Load should return defaults
          const loaded = loadPanelSizes(mockStorage);
          expect(loaded).toEqual(DEFAULT_PANEL_SIZES);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 10: Panel Proportion Persistence Round-Trip**
   * **Validates: Requirements 8.2**
   * 
   * Arrays with wrong length should return defaults.
   */
  test('Property 10: arrays with wrong length return defaults', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.array(fc.integer({ min: 10, max: 90 }), { minLength: 0, maxLength: 1 }),
          fc.array(fc.integer({ min: 10, max: 90 }), { minLength: 3, maxLength: 5 }),
        ),
        (wrongLengthArray) => {
          // Save array with wrong length
          mockStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(wrongLengthArray));
          
          // Load should return defaults
          const loaded = loadPanelSizes(mockStorage);
          expect(loaded).toEqual(DEFAULT_PANEL_SIZES);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 10: Panel Proportion Persistence Round-Trip**
   * **Validates: Requirements 8.2**
   * 
   * Empty storage should return defaults.
   */
  test('Property 10: empty storage returns defaults', () => {
    // Clear storage
    mockStorage.clear();
    
    // Load should return defaults
    const loaded = loadPanelSizes(mockStorage);
    expect(loaded).toEqual(DEFAULT_PANEL_SIZES);
  });

  /**
   * **Feature: magic-grading-engine, Property 10: Panel Proportion Persistence Round-Trip**
   * **Validates: Requirements 8.2**
   * 
   * Multiple saves should preserve the last value.
   */
  test('Property 10: multiple saves preserve last value', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 10, max: 90 }).map(left => [left, 100 - left]),
          { minLength: 2, maxLength: 5 }
        ),
        (sizesList) => {
          // Save multiple times
          for (const sizes of sizesList) {
            savePanelSizes(mockStorage, sizes);
          }
          
          // Load should return the last saved value
          const loaded = loadPanelSizes(mockStorage);
          const lastSizes = sizesList[sizesList.length - 1];
          expect(loaded).toEqual(lastSizes);
        }
      )
    );
  });
});
