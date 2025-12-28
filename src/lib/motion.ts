/**
 * Motion configuration for Educassol UI animations
 * Uses Framer Motion spring physics and easing for smooth, professional animations
 * 
 * Requirements: 9.1, 9.2
 */

/**
 * Spring physics configuration for natural, bouncy animations
 * Used for interactive elements and transitions
 */
export const EDUCASSOL_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 30,
} as const;

/**
 * Easing configuration for smooth, polished transitions
 * Uses custom cubic-bezier curve for professional feel
 */
export const EDUCASSOL_EASE = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
} as const;

/**
 * Parent container variant for staggered child animations
 * Apply to parent elements that contain multiple animated children
 */
export const STAGGER_PARENT = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
} as const;

/**
 * Fade-up animation variant for list items and cards
 * Children of STAGGER_PARENT should use this variant
 */
export const FADE_UP_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
} as const;
