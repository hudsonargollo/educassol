import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Color definitions from the ExamAI design system
 * These are the actual color values used in the application
 */
const DESIGN_SYSTEM_COLORS = {
  dark: {
    // Backgrounds
    background: { h: 222, s: 47, l: 6 },           // #0a0d14
    backgroundSecondary: { h: 222, s: 47, l: 9 },  // #101520
    card: { h: 222, s: 47, l: 11 },                // #141a26
    
    // Text
    foreground: { h: 210, s: 40, l: 98 },          // #f8fafc
    mutedForeground: { h: 215, s: 20, l: 65 },     // #94a3b8
    
    // Accents
    primary: { h: 270, s: 95, l: 65 },             // #a855f7 - Purple
    secondary: { h: 38, s: 92, l: 50 },            // #f59e0b - Amber
  },
  light: {
    // Backgrounds
    background: { h: 0, s: 0, l: 100 },            // #ffffff
    backgroundSecondary: { h: 210, s: 40, l: 98 }, // #f8fafc
    card: { h: 0, s: 0, l: 100 },                  // #ffffff
    
    // Text
    foreground: { h: 222, s: 47, l: 11 },          // #1e293b
    mutedForeground: { h: 215, s: 16, l: 47 },     // #64748b
    
    // Accents
    primary: { h: 270, s: 95, l: 55 },             // Purple
    secondary: { h: 38, s: 92, l: 50 },            // Amber
  },
};

/**
 * Text/background combinations that must meet WCAG AA contrast
 */
const TEXT_BACKGROUND_PAIRS = {
  dark: [
    { text: 'foreground', background: 'background', description: 'Main text on background' },
    { text: 'foreground', background: 'card', description: 'Main text on card' },
    { text: 'mutedForeground', background: 'background', description: 'Muted text on background' },
    { text: 'mutedForeground', background: 'card', description: 'Muted text on card' },
  ],
  light: [
    { text: 'foreground', background: 'background', description: 'Main text on background' },
    { text: 'foreground', background: 'card', description: 'Main text on card' },
    { text: 'mutedForeground', background: 'background', description: 'Muted text on background' },
    { text: 'mutedForeground', background: 'card', description: 'Muted text on card' },
  ],
};

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function getContrastRatio(
  color1: { h: number; s: number; l: number },
  color2: { h: number; s: number; l: number }
): number {
  const rgb1 = hslToRgb(color1.h, color1.s, color1.l);
  const rgb2 = hslToRgb(color2.h, color2.s, color2.l);
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG AA minimum contrast ratio for normal text
 */
const WCAG_AA_NORMAL_TEXT = 4.5;

/**
 * WCAG AA minimum contrast ratio for large text (18pt+ or 14pt+ bold)
 */
const WCAG_AA_LARGE_TEXT = 3.0;

describe('WCAG Contrast Compliance Property Tests', () => {
  /**
   * **Feature: examai-design-system, Property 5: WCAG Contrast Compliance**
   * **Validates: Requirements 3.4, 4.3**
   * 
   * *For any* text color and background color combination defined in the Design_System,
   * the contrast ratio should be at least 4.5:1 for normal text (WCAG AA compliance).
   */
  test('Property 5: dark mode text/background combinations meet WCAG AA', () => {
    for (const pair of TEXT_BACKGROUND_PAIRS.dark) {
      const textColor = DESIGN_SYSTEM_COLORS.dark[pair.text as keyof typeof DESIGN_SYSTEM_COLORS.dark];
      const bgColor = DESIGN_SYSTEM_COLORS.dark[pair.background as keyof typeof DESIGN_SYSTEM_COLORS.dark];
      
      const ratio = getContrastRatio(textColor, bgColor);
      
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    }
  });

  /**
   * **Feature: examai-design-system, Property 5: WCAG Contrast Compliance**
   * **Validates: Requirements 3.4, 4.3**
   */
  test('Property 5: light mode text/background combinations meet WCAG AA', () => {
    for (const pair of TEXT_BACKGROUND_PAIRS.light) {
      const textColor = DESIGN_SYSTEM_COLORS.light[pair.text as keyof typeof DESIGN_SYSTEM_COLORS.light];
      const bgColor = DESIGN_SYSTEM_COLORS.light[pair.background as keyof typeof DESIGN_SYSTEM_COLORS.light];
      
      const ratio = getContrastRatio(textColor, bgColor);
      
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    }
  });

  /**
   * **Feature: examai-design-system, Property 5: WCAG Contrast Compliance**
   * **Validates: Requirements 3.4, 4.3**
   * 
   * Property test: For any valid HSL color pair where one is light (l > 70) 
   * and one is dark (l < 30), the contrast ratio should be high.
   */
  test('Property 5: high contrast pairs have sufficient contrast ratio', () => {
    fc.assert(
      fc.property(
        fc.record({
          lightColor: fc.record({
            h: fc.integer({ min: 0, max: 360 }),
            s: fc.integer({ min: 0, max: 100 }),
            l: fc.integer({ min: 85, max: 100 }), // Very light
          }),
          darkColor: fc.record({
            h: fc.integer({ min: 0, max: 360 }),
            s: fc.integer({ min: 0, max: 100 }),
            l: fc.integer({ min: 0, max: 15 }), // Very dark
          }),
        }),
        ({ lightColor, darkColor }) => {
          const ratio = getContrastRatio(lightColor, darkColor);
          // Very light on very dark should always have high contrast
          expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 5: WCAG Contrast Compliance**
   * **Validates: Requirements 3.4, 4.3**
   * 
   * Property test: Contrast ratio is symmetric (A vs B = B vs A)
   */
  test('Property 5: contrast ratio is symmetric', () => {
    fc.assert(
      fc.property(
        fc.record({
          color1: fc.record({
            h: fc.integer({ min: 0, max: 360 }),
            s: fc.integer({ min: 0, max: 100 }),
            l: fc.integer({ min: 0, max: 100 }),
          }),
          color2: fc.record({
            h: fc.integer({ min: 0, max: 360 }),
            s: fc.integer({ min: 0, max: 100 }),
            l: fc.integer({ min: 0, max: 100 }),
          }),
        }),
        ({ color1, color2 }) => {
          const ratio1 = getContrastRatio(color1, color2);
          const ratio2 = getContrastRatio(color2, color1);
          
          // Contrast ratio should be the same regardless of order
          expect(ratio1).toBeCloseTo(ratio2, 10);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 5: WCAG Contrast Compliance**
   * **Validates: Requirements 3.4, 4.3**
   * 
   * Property test: Same color has contrast ratio of 1
   */
  test('Property 5: same color has contrast ratio of 1', () => {
    fc.assert(
      fc.property(
        fc.record({
          h: fc.integer({ min: 0, max: 360 }),
          s: fc.integer({ min: 0, max: 100 }),
          l: fc.integer({ min: 0, max: 100 }),
        }),
        (color) => {
          const ratio = getContrastRatio(color, color);
          expect(ratio).toBeCloseTo(1, 10);
        }
      )
    );
  });

  /**
   * **Feature: examai-design-system, Property 5: WCAG Contrast Compliance**
   * **Validates: Requirements 3.4, 4.3**
   * 
   * Property test: Contrast ratio is always >= 1
   */
  test('Property 5: contrast ratio is always at least 1', () => {
    fc.assert(
      fc.property(
        fc.record({
          color1: fc.record({
            h: fc.integer({ min: 0, max: 360 }),
            s: fc.integer({ min: 0, max: 100 }),
            l: fc.integer({ min: 0, max: 100 }),
          }),
          color2: fc.record({
            h: fc.integer({ min: 0, max: 360 }),
            s: fc.integer({ min: 0, max: 100 }),
            l: fc.integer({ min: 0, max: 100 }),
          }),
        }),
        ({ color1, color2 }) => {
          const ratio = getContrastRatio(color1, color2);
          expect(ratio).toBeGreaterThanOrEqual(1);
        }
      )
    );
  });
});
