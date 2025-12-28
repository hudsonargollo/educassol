# Implementation Plan: ExamAI Design System

## Overview

This implementation plan transforms the ExamAI design system specification into actionable coding tasks. The approach prioritizes establishing the theme infrastructure first, then building out component styling, and finally applying the design system across pages.

## Tasks

- [x] 1. Set up theme infrastructure and CSS tokens
  - [x] 1.1 Update Tailwind configuration with ExamAI color palette
    - Add examai color tokens (purple, navy, amber) to tailwind.config.ts
    - Add gradient utilities and custom animations
    - Configure dark mode to use class strategy
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.2 Update global CSS with theme variables
    - Define CSS custom properties for dark mode palette in index.css
    - Define CSS custom properties for light mode palette
    - Add glassmorphism utility classes
    - Add gradient background classes
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 4.1, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 1.3 Write property test for WCAG contrast compliance
    - **Property 5: WCAG Contrast Compliance**
    - **Validates: Requirements 3.4, 4.3**

- [x] 2. Implement ThemeProvider and ThemeToggle components
  - [x] 2.1 Create ThemeProvider context component
    - Create src/components/theme/ThemeProvider.tsx
    - Implement localStorage persistence
    - Implement system preference detection
    - Apply theme class to document root
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property test for theme persistence round-trip
    - **Property 1: Theme Persistence Round-Trip**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Create ThemeToggle component
    - Create src/components/theme/ThemeToggle.tsx
    - Implement sun/moon icon switching with animation
    - Add keyboard accessibility and ARIA labels
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.4 Write property tests for theme toggle behavior
    - **Property 2: Theme Toggle Inversion**
    - **Property 3: Theme Icon Consistency**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 2.5 Write property test for document root class application
    - **Property 4: Document Root Class Application**
    - **Validates: Requirements 1.4**

  - [x] 2.6 Export theme components and integrate ThemeProvider into App
    - Create src/components/theme/index.ts barrel export
    - Wrap App component with ThemeProvider
    - _Requirements: 1.5_

- [x] 3. Checkpoint - Verify theme infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Enhance UI component styling
  - [x] 4.1 Update Card component with ExamAI variants
    - Add variant prop ('default', 'gradient', 'glass', 'feature')
    - Implement dark/light mode border and background styles
    - Add hover state transitions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 4.2 Write property test for card variant styling
    - **Property 6: Card Variant Styling Consistency**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.5**

  - [x] 4.3 Update Button component with ExamAI styling
    - Update primary button with purple gradient
    - Add secondary button with transparent/border style
    - Add CTA button with amber gradient
    - Implement hover, focus, and disabled states
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 4.4 Write property test for button state styling
    - **Property 7: Button State Styling**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

  - [x] 4.5 Update Input component with ExamAI styling
    - Apply dark/light mode background and border colors
    - Implement focus state with purple ring
    - Style placeholder text
    - Add error state styling
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5. Create dashboard components
  - [x] 5.1 Create FeatureCard component for dashboard
    - Create src/components/dashboard/FeatureCard.tsx
    - Implement icon, title, description layout
    - Add optional illustration area
    - Support gradient variants
    - _Requirements: 11.1, 11.2, 11.5_

  - [x] 5.2 Create WelcomeBanner component
    - Create personalized welcome message with user name
    - Add AI exam generator prompt card
    - _Requirements: 11.3, 11.4_

- [x] 6. Create Support Chat widget
  - [x] 6.1 Create SupportChat component
    - Create src/components/support/SupportChat.tsx
    - Implement floating button with purple styling
    - Create expandable chat panel with header, messages, input
    - Add online/offline status indicator
    - Ensure styling works in both dark and light modes
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 7. Checkpoint - Verify component styling
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Update Header/Navigation with theme support
  - [x] 8.1 Update Header component
    - Add glassmorphism background with backdrop blur
    - Make header fixed position with appropriate z-index
    - Add ThemeToggle to header
    - Style navigation links with purple hover states
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 2.5_

- [x] 9. Apply design system to landing page
  - [x] 9.1 Update HeroSection with ExamAI styling
    - Apply gradient background
    - Add floating decorative elements
    - Update typography and button styling
    - _Requirements: 10.1_

  - [x] 9.2 Update FeaturesSection with card layouts
    - Apply card-based layouts with icons
    - Ensure consistent spacing and styling
    - _Requirements: 10.2_

  - [x] 9.3 Update TestimonialsSection styling
    - Style testimonial cards with ExamAI design
    - _Requirements: 10.3_

  - [x] 9.4 Update CTASection with gradient background
    - Apply gradient background styling
    - Update button styling
    - _Requirements: 10.4_

  - [x] 9.5 Update Footer with theme support
    - Apply dark/light mode styling
    - _Requirements: 10.5_

- [x] 10. Apply design system to internal pages
  - [x] 10.1 Update Dashboard page layout
    - Apply FeatureCard grid layout
    - Integrate WelcomeBanner
    - Ensure responsive behavior
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_

  - [x] 10.2 Update Settings page styling
    - Apply tabbed navigation with purple active state
    - Style profile section with avatar
    - Apply form input styling
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 10.3 Update Auth page styling
    - Apply ExamAI login form styling
    - Add decorative elements matching screenshots
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Final checkpoint - Complete design system verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify dark/light mode toggle works across all pages
  - Verify consistent styling throughout application

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- The implementation uses TypeScript with React and Tailwind CSS
- Testing framework: Vitest with @testing-library/react for component tests
