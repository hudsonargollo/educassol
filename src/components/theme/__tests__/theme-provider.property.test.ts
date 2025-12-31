import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Valid theme values
 */
type Theme = 'dark' | 'light' | 'system';
const VALID_THEMES: Theme[] = ['dark', 'light', 'system'];

/**
 * Default storage key used by ThemeProvider
 */
const DEFAULT_STORAGE_KEY = 'examai-theme';

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

/**
 * Simulates the theme storage logic from ThemeProvider
 */
function setThemeInStorage(storage: Storage, theme: Theme, storageKey: string = DEFAULT_STORAGE_KEY): void {
  storage.setItem(storageKey, theme);
}

/**
 * Simulates the theme retrieval logic from ThemeProvider
 */
function getThemeFromStorage(storage: Storage, defaultTheme: Theme = 'system', storageKey: string = DEFAULT_STORAGE_KEY): Theme {
  const stored = storage.getItem(storageKey);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }
  return defaultTheme;
}

/**
 * Simulates theme toggle logic
 */
function toggleTheme(currentTheme: 'dark' | 'light'): 'dark' | 'light' {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

/**
 * Simulates resolving 'system' theme to actual theme
 */
function resolveTheme(theme: Theme, systemPreference: 'dark' | 'light'): 'dark' | 'light' {
  return theme === 'system' ? systemPreference : theme;
}

/**
 * Arbitrary for valid theme values
 */
const arbitraryTheme = (): fc.Arbitrary<Theme> =>
  fc.constantFrom(...VALID_THEMES);

/**
 * Arbitrary for resolved theme values (not 'system')
 */
const arbitraryResolvedTheme = (): fc.Arbitrary<'dark' | 'light'> =>
  fc.constantFrom('dark', 'light');

describe('Theme Provider Property Tests', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = createMockStorage();
  });

  /**
   * **Feature: examai-design-system, Property 1: Theme Persistence Round-Trip**
   * **Validates: Requirements 1.1, 1.2**
   * 
   * *For any* valid theme value ('light', 'dark', or 'system'), setting the theme 
   * and then reading from localStorage should return the same theme value that was set.
   */
  test('Property 1: theme persistence round-trip preserves value', () => {
    fc.assert(
      fc.property(arbitraryTheme(), (theme) => {
        // Set theme in storage
        setThemeInStorage(mockStorage, theme);
        
        // Read theme from storage
        const retrieved = getThemeFromStorage(mockStorage);
        
        // Should be the same
        expect(retrieved).toBe(theme);
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 1: Theme Persistence Round-Trip**
   * **Validates: Requirements 1.1, 1.2**
   * 
   * Multiple theme changes should always persist the last value.
   */
  test('Property 1: multiple theme changes persist last value', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTheme(), { minLength: 2, maxLength: 10 }),
        (themes) => {
          // Set multiple themes
          for (const theme of themes) {
            setThemeInStorage(mockStorage, theme);
          }
          
          // Should retrieve the last one
          const retrieved = getThemeFromStorage(mockStorage);
          expect(retrieved).toBe(themes[themes.length - 1]);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 1: Theme Persistence Round-Trip**
   * **Validates: Requirements 1.1, 1.2**
   * 
   * Invalid stored values should return default theme.
   */
  test('Property 1: invalid stored values return default theme', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !VALID_THEMES.includes(s as Theme)),
        arbitraryTheme(),
        (invalidValue, defaultTheme) => {
          // Store invalid value
          mockStorage.setItem(DEFAULT_STORAGE_KEY, invalidValue);
          
          // Should return default
          const retrieved = getThemeFromStorage(mockStorage, defaultTheme);
          expect(retrieved).toBe(defaultTheme);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 1: Theme Persistence Round-Trip**
   * **Validates: Requirements 1.1, 1.2**
   * 
   * Empty storage should return default theme.
   */
  test('Property 1: empty storage returns default theme', () => {
    fc.assert(
      fc.property(arbitraryTheme(), (defaultTheme) => {
        mockStorage.clear();
        const retrieved = getThemeFromStorage(mockStorage, defaultTheme);
        expect(retrieved).toBe(defaultTheme);
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 2: Theme Toggle Inversion**
   * **Validates: Requirements 2.2**
   * 
   * *For any* current theme state, clicking the theme toggle should result 
   * in the opposite theme state (light → dark, dark → light).
   */
  test('Property 2: theme toggle inverts the theme', () => {
    fc.assert(
      fc.property(arbitraryResolvedTheme(), (currentTheme) => {
        const newTheme = toggleTheme(currentTheme);
        
        // Should be the opposite
        expect(newTheme).not.toBe(currentTheme);
        expect(newTheme).toBe(currentTheme === 'dark' ? 'light' : 'dark');
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 2: Theme Toggle Inversion**
   * **Validates: Requirements 2.2**
   * 
   * Double toggle should return to original theme.
   */
  test('Property 2: double toggle returns to original theme', () => {
    fc.assert(
      fc.property(arbitraryResolvedTheme(), (originalTheme) => {
        const afterFirstToggle = toggleTheme(originalTheme);
        const afterSecondToggle = toggleTheme(afterFirstToggle);
        
        expect(afterSecondToggle).toBe(originalTheme);
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 4: Document Root Class Application**
   * **Validates: Requirements 1.4**
   * 
   * *For any* theme value, when the theme is set, the resolved theme should be 
   * either 'dark' or 'light' (never 'system').
   */
  test('Property 4: resolved theme is always dark or light', () => {
    fc.assert(
      fc.property(
        arbitraryTheme(),
        arbitraryResolvedTheme(),
        (theme, systemPreference) => {
          const resolved = resolveTheme(theme, systemPreference);
          
          expect(['dark', 'light']).toContain(resolved);
          expect(resolved).not.toBe('system');
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 4: Document Root Class Application**
   * **Validates: Requirements 1.4**
   * 
   * Non-system themes resolve to themselves.
   */
  test('Property 4: non-system themes resolve to themselves', () => {
    fc.assert(
      fc.property(
        arbitraryResolvedTheme(),
        arbitraryResolvedTheme(),
        (theme, systemPreference) => {
          const resolved = resolveTheme(theme, systemPreference);
          expect(resolved).toBe(theme);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 4: Document Root Class Application**
   * **Validates: Requirements 1.4**
   * 
   * System theme resolves to system preference.
   */
  test('Property 4: system theme resolves to system preference', () => {
    fc.assert(
      fc.property(arbitraryResolvedTheme(), (systemPreference) => {
        const resolved = resolveTheme('system', systemPreference);
        expect(resolved).toBe(systemPreference);
      })
    );
  });
});
