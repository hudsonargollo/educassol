/**
 * Educassol color palette tokens
 * Centralized color definitions for consistent UI theming
 * 
 * WCAG 2.1 AA Compliance Notes:
 * - textMain (#0F172A) on secondary (#F1F5F9): Contrast ratio ~15.5:1 ✓
 * - textMain (#0F172A) on white: Contrast ratio ~16.9:1 ✓
 * - textMuted (#64748B) on white: Contrast ratio ~4.7:1 ✓ (meets AA for normal text)
 * - primary (#2563EB) on white: Contrast ratio ~4.5:1 ✓ (meets AA for large text)
 * - success (#10B981) on white: Contrast ratio ~3.0:1 (use with larger text or icons)
 * - error (#E11D48) on white: Contrast ratio ~4.5:1 ✓
 * - accent (#F59E0B) on textMain: Contrast ratio ~7.5:1 ✓
 * 
 * Requirements: 9.6, 9.7, 10.3
 */

export const EDUCASSOL_COLORS = {
  /** Educassol Blue - main actions and primary interactive elements */
  primary: '#2563EB',
  
  /** Page backgrounds and secondary surfaces */
  secondary: '#F1F5F9',
  
  /** Innovation Amber - AI triggers and pending states */
  accent: '#F59E0B',
  
  /** Deep Navy - headlines and main text */
  textMain: '#0F172A',
  
  /** Labels, meta-data, and muted text */
  textMuted: '#64748B',
  
  /** Dividers, inputs, and borders */
  border: '#E2E8F0',
  
  /** Success Emerald - completed grades and success states */
  success: '#10B981',
  
  /** Alert Rose - errors and warning states */
  error: '#E11D48',
} as const;

/** Type for color keys */
export type EducassolColorKey = keyof typeof EDUCASSOL_COLORS;

/** Type for color values */
export type EducassolColorValue = typeof EDUCASSOL_COLORS[EducassolColorKey];
