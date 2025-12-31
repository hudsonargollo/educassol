import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { buttonVariants } from '../button';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Valid button variants
 */
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'cta' | 'hero' | 'sun' | 'solid';
const BUTTON_VARIANTS: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'cta', 'hero', 'sun', 'solid'];

/**
 * Valid button sizes
 */
type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';
const BUTTON_SIZES: ButtonSize[] = ['default', 'sm', 'lg', 'xl', 'icon'];

/**
 * Common classes that should be present in all button variants
 */
const COMMON_CLASSES = [
  'inline-flex',
  'items-center',
  'justify-center',
  'font-medium',
  'transition-all',
  'disabled:pointer-events-none',
  'disabled:opacity-50',
];

/**
 * Focus state classes that should be present in all variants
 */
const FOCUS_CLASSES = [
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
];

/**
 * Variants that should have gradient backgrounds
 */
const GRADIENT_VARIANTS: ButtonVariant[] = ['default', 'cta', 'hero'];

/**
 * Variants that should have border styling
 */
const BORDER_VARIANTS: ButtonVariant[] = ['outline', 'secondary'];

/**
 * Variants that should have hover translate effect
 */
const HOVER_TRANSLATE_VARIANTS: ButtonVariant[] = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'cta', 'hero', 'sun', 'solid'];

/**
 * Arbitrary for button variants
 */
const arbitraryButtonVariant = (): fc.Arbitrary<ButtonVariant> =>
  fc.constantFrom(...BUTTON_VARIANTS);

/**
 * Arbitrary for button sizes
 */
const arbitraryButtonSize = (): fc.Arbitrary<ButtonSize> =>
  fc.constantFrom(...BUTTON_SIZES);

describe('Button State Styling Property Tests', () => {
  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * *For any* button variant and state combination (default, hover, disabled, focus),
   * the button should render with the appropriate styling classes for that combination.
   */
  test('Property 7: all variants include common base classes', () => {
    fc.assert(
      fc.property(arbitraryButtonVariant(), (variant) => {
        const classes = buttonVariants({ variant });
        
        for (const commonClass of COMMON_CLASSES) {
          expect(classes).toContain(commonClass);
        }
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * All variants should include focus state classes for accessibility.
   */
  test('Property 7: all variants include focus state classes', () => {
    fc.assert(
      fc.property(arbitraryButtonVariant(), (variant) => {
        const classes = buttonVariants({ variant });
        
        for (const focusClass of FOCUS_CLASSES) {
          expect(classes).toContain(focusClass);
        }
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * All variants should include disabled state classes.
   */
  test('Property 7: all variants include disabled state classes', () => {
    fc.assert(
      fc.property(arbitraryButtonVariant(), (variant) => {
        const classes = buttonVariants({ variant });
        
        expect(classes).toContain('disabled:pointer-events-none');
        expect(classes).toContain('disabled:opacity-50');
      })
    );
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Gradient variants should include gradient background classes.
   */
  test('Property 7: gradient variants include gradient classes', () => {
    for (const variant of GRADIENT_VARIANTS) {
      const classes = buttonVariants({ variant });
      expect(classes).toMatch(/bg-gradient/);
    }
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Border variants should include border classes.
   */
  test('Property 7: border variants include border classes', () => {
    for (const variant of BORDER_VARIANTS) {
      const classes = buttonVariants({ variant });
      expect(classes).toContain('border-2');
      expect(classes).toContain('border-examai-purple-500');
    }
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Most variants should include hover translate effect.
   */
  test('Property 7: hover translate variants include translate classes', () => {
    for (const variant of HOVER_TRANSLATE_VARIANTS) {
      const classes = buttonVariants({ variant });
      expect(classes).toMatch(/hover:-translate-y/);
    }
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Different variants should produce different class strings.
   */
  test('Property 7: different variants produce different classes', () => {
    fc.assert(
      fc.property(
        arbitraryButtonVariant(),
        arbitraryButtonVariant(),
        (variant1, variant2) => {
          fc.pre(variant1 !== variant2);
          
          const classes1 = buttonVariants({ variant: variant1 });
          const classes2 = buttonVariants({ variant: variant2 });
          
          expect(classes1).not.toBe(classes2);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Same variant with same size should produce identical classes.
   */
  test('Property 7: same variant and size produces consistent classes', () => {
    fc.assert(
      fc.property(
        arbitraryButtonVariant(),
        arbitraryButtonSize(),
        (variant, size) => {
          const classes1 = buttonVariants({ variant, size });
          const classes2 = buttonVariants({ variant, size });
          
          expect(classes1).toBe(classes2);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Different sizes should produce different height classes.
   */
  test('Property 7: different sizes produce different height classes', () => {
    fc.assert(
      fc.property(
        arbitraryButtonSize(),
        arbitraryButtonSize(),
        (size1, size2) => {
          fc.pre(size1 !== size2);
          
          const classes1 = buttonVariants({ size: size1 });
          const classes2 = buttonVariants({ size: size2 });
          
          // Extract height classes
          const height1 = classes1.match(/h-\d+/)?.[0];
          const height2 = classes2.match(/h-\d+/)?.[0];
          
          // Different sizes should have different heights (except icon which has both h and w)
          if (size1 !== 'icon' && size2 !== 'icon') {
            expect(height1).not.toBe(height2);
          }
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * CTA variant should have amber gradient.
   */
  test('Property 7: CTA variant has amber gradient', () => {
    const classes = buttonVariants({ variant: 'cta' });
    
    expect(classes).toContain('from-examai-amber-500');
    expect(classes).toContain('to-examai-amber-600');
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Default variant should have purple gradient.
   */
  test('Property 7: default variant has purple gradient', () => {
    const classes = buttonVariants({ variant: 'default' });
    
    expect(classes).toContain('from-examai-purple-500');
    expect(classes).toContain('to-examai-purple-600');
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Link variant should have underline on hover.
   */
  test('Property 7: link variant has underline on hover', () => {
    const classes = buttonVariants({ variant: 'link' });
    
    expect(classes).toContain('hover:underline');
    expect(classes).toContain('underline-offset-4');
  });

  /**
   * **Feature: examai-design-system, Property 7: Button State Styling**
   * **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**
   * 
   * Icon size should have equal width and height.
   */
  test('Property 7: icon size has equal width and height', () => {
    const classes = buttonVariants({ size: 'icon' });
    
    expect(classes).toContain('h-10');
    expect(classes).toContain('w-10');
  });
});
