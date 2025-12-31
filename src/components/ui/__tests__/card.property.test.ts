import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { cardVariants } from '../card';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Valid card variants
 */
type CardVariant = 'default' | 'gradient' | 'glass' | 'feature' | 'elevated';
const CARD_VARIANTS: CardVariant[] = ['default', 'gradient', 'glass', 'feature', 'elevated'];

/**
 * Expected CSS classes for each variant
 */
const VARIANT_EXPECTED_CLASSES: Record<CardVariant, string[]> = {
  default: ['bg-card', 'border', 'border-border'],
  gradient: ['bg-gradient-to-br', 'from-examai-purple-500/10', 'to-violet-500/5', 'border-examai-purple-500/20'],
  glass: ['backdrop-blur-md', 'border'],
  feature: ['bg-card', 'border', 'border-border', 'cursor-pointer'],
  elevated: ['bg-card', 'border', 'border-border', 'shadow-lg'],
};

/**
 * Common classes that should be present in all variants
 */
const COMMON_CLASSES = ['rounded-xl', 'text-card-foreground', 'transition-all'];

/**
 * Arbitrary for card variants
 */
const arbitraryCardVariant = (): fc.Arbitrary<CardVariant> =>
  fc.constantFrom(...CARD_VARIANTS);

/**
 * Arbitrary for interactive boolean
 */
const arbitraryInteractive = (): fc.Arbitrary<boolean> =>
  fc.boolean();

describe('Card Variant Styling Property Tests', () => {
  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * *For any* card variant ('default', 'gradient', 'glass', 'feature'), the rendered 
   * card should include the CSS classes specific to that variant.
   */
  test('Property 6: each variant includes its specific CSS classes', () => {
    fc.assert(
      fc.property(arbitraryCardVariant(), (variant) => {
        const classes = cardVariants({ variant });
        const expectedClasses = VARIANT_EXPECTED_CLASSES[variant];
        
        for (const expectedClass of expectedClasses) {
          expect(classes).toContain(expectedClass);
        }
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * All variants should include common base classes.
   */
  test('Property 6: all variants include common base classes', () => {
    fc.assert(
      fc.property(arbitraryCardVariant(), (variant) => {
        const classes = cardVariants({ variant });
        
        for (const commonClass of COMMON_CLASSES) {
          expect(classes).toContain(commonClass);
        }
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Interactive cards should include cursor-pointer and active scale classes.
   */
  test('Property 6: interactive cards include interaction classes', () => {
    fc.assert(
      fc.property(arbitraryCardVariant(), (variant) => {
        const classes = cardVariants({ variant, interactive: true });
        
        expect(classes).toContain('cursor-pointer');
        expect(classes).toContain('active:scale-[0.98]');
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Non-interactive cards should not include active scale class.
   */
  test('Property 6: non-interactive cards do not include active scale', () => {
    fc.assert(
      fc.property(
        arbitraryCardVariant().filter(v => v !== 'feature'), // feature always has cursor-pointer
        (variant) => {
          const classes = cardVariants({ variant, interactive: false });
          
          expect(classes).not.toContain('active:scale-[0.98]');
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Different variants should produce different class strings.
   */
  test('Property 6: different variants produce different classes', () => {
    fc.assert(
      fc.property(
        arbitraryCardVariant(),
        arbitraryCardVariant(),
        (variant1, variant2) => {
          fc.pre(variant1 !== variant2);
          
          const classes1 = cardVariants({ variant: variant1 });
          const classes2 = cardVariants({ variant: variant2 });
          
          expect(classes1).not.toBe(classes2);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Same variant with same options should produce identical classes.
   */
  test('Property 6: same variant produces consistent classes', () => {
    fc.assert(
      fc.property(
        arbitraryCardVariant(),
        arbitraryInteractive(),
        (variant, interactive) => {
          const classes1 = cardVariants({ variant, interactive });
          const classes2 = cardVariants({ variant, interactive });
          
          expect(classes1).toBe(classes2);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * All variants should include hover state classes.
   */
  test('Property 6: all variants include hover state classes', () => {
    fc.assert(
      fc.property(arbitraryCardVariant(), (variant) => {
        const classes = cardVariants({ variant });
        
        // All variants should have some hover effect
        expect(classes).toMatch(/hover:/);
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Gradient variant should include gradient-specific classes.
   */
  test('Property 6: gradient variant includes gradient classes', () => {
    const classes = cardVariants({ variant: 'gradient' });
    
    expect(classes).toContain('bg-gradient-to-br');
    expect(classes).toContain('from-examai-purple-500/10');
    expect(classes).toContain('to-violet-500/5');
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Glass variant should include glassmorphism classes.
   */
  test('Property 6: glass variant includes glassmorphism classes', () => {
    const classes = cardVariants({ variant: 'glass' });
    
    expect(classes).toContain('backdrop-blur-md');
  });

  /**
   * **Feature: examai-design-system, Property 6: Card Variant Styling Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * Feature variant should include cursor-pointer by default.
   */
  test('Property 6: feature variant includes cursor-pointer', () => {
    const classes = cardVariants({ variant: 'feature' });
    
    expect(classes).toContain('cursor-pointer');
  });
});
