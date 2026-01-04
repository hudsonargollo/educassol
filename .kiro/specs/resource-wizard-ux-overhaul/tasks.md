# Implementation Plan: Resource Creation Wizard UX Overhaul

## Overview

This implementation plan restructures the Content Wizard from its current prop-drilling architecture into a context-based state management system with 5 balanced steps. Tasks are ordered to build foundational infrastructure first, then implement each step component, and finally wire everything together.

## Tasks

- [x] 1. Set up wizard infrastructure and state management
  - [x] 1.1 Create WizardContext with centralized state types and context value interface
    - Create `src/components/dashboard/wizard/WizardContext.tsx`
    - Define WizardState interface with all fields from design
    - Define WizardContextValue interface with state and actions
    - Export context and custom useWizard hook
    - _Requirements: 7.1_

  - [x] 1.2 Create WizardProvider with localStorage persistence
    - Create `src/components/dashboard/wizard/WizardProvider.tsx`
    - Implement state initialization from localStorage
    - Implement save to localStorage on state change (debounced)
    - Implement 24-hour expiration check
    - Implement resetWizard function to clear state
    - _Requirements: 7.2, 7.3_

  - [ ]* 1.3 Write property test for state persistence round-trip
    - **Property 8: State Persistence Round-Trip**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 1.4 Create useWizardNavigation hook for step validation and navigation
    - Create `src/components/dashboard/wizard/hooks/useWizardNavigation.ts`
    - Implement canProceed logic for each step
    - Implement goToStep, nextStep, prevStep functions
    - _Requirements: 8.3, 8.4_

  - [ ]* 1.5 Write property test for navigation state preservation
    - **Property 9: Navigation State Preservation**
    - **Validates: Requirements 8.4**

- [x] 2. Create shared wizard components
  - [x] 2.1 Create ProgressHeader component with phase labels
    - Create `src/components/dashboard/wizard/components/ProgressHeader.tsx`
    - Display progress bar with step indicators
    - Show current phase text label
    - Highlight completed and current steps
    - _Requirements: 8.1, 8.2_

  - [x] 2.2 Create MethodologyCard component for visual selection
    - Create `src/components/dashboard/wizard/components/MethodologyCard.tsx`
    - Display icon, title, and description
    - Implement selected state with border-primary styling
    - Handle click to toggle selection
    - _Requirements: 4.1_

  - [x] 2.3 Create BnccChips component for standards display
    - Create `src/components/dashboard/wizard/components/BnccChips.tsx`
    - Render array of BNCC codes as Badge components
    - Include remove button on each chip
    - Handle removal callback
    - _Requirements: 3.3_

  - [ ]* 2.4 Write property test for BNCC chips rendering
    - **Property 4: BNCC Chips Rendering**
    - **Validates: Requirements 3.3**

  - [x] 2.5 Create SummaryCard component for review step
    - Create `src/components/dashboard/wizard/components/SummaryCard.tsx`
    - Display section title and content
    - Handle click to navigate to edit step
    - _Requirements: 6.1, 6.3_

- [x] 3. Checkpoint - Ensure infrastructure tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Step 1: Context
  - [x] 4.1 Create StepContext component combining class/grade/subject selection
    - Create `src/components/dashboard/wizard/StepContext.tsx`
    - Implement class dropdown with auto-population logic
    - Implement conditional manual grade/subject selection
    - Use WizardContext for state management
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 4.2 Write property test for class selection auto-population
    - **Property 1: Class Selection Auto-Population**
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 4.3 Write property test for manual mode exclusivity
    - **Property 2: Manual Mode Exclusivity**
    - **Validates: Requirements 2.3**

- [x] 5. Implement Step 2: Objectives
  - [x] 5.1 Create StepObjectives component with topic input and BNCC integration
    - Create `src/components/dashboard/wizard/StepObjectives.tsx`
    - Implement topic textarea with validation
    - Implement debounced BNCC suggestion trigger (500ms)
    - Add "Find Standards" button as alternative trigger
    - Integrate BnccChips component for selected standards
    - Use Skeleton loader during BNCC API call
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.2 Write property test for topic validation gate
    - **Property 3: Topic Validation Gate**
    - **Validates: Requirements 3.4**

- [x] 6. Implement Step 3: Strategy
  - [x] 6.1 Create StepStrategy component with methodology cards and templates
    - Create `src/components/dashboard/wizard/StepStrategy.tsx`
    - Render methodology options as MethodologyCard grid
    - Integrate TemplateSelector as carousel/grid
    - Add "Teacher Notes" textarea for specific ideas
    - _Requirements: 4.1, 4.2, 4.3, 1.3_

- [x] 7. Implement Step 4: Configuration
  - [x] 7.1 Create StepConfiguration component with logistics and accessibility
    - Create `src/components/dashboard/wizard/StepConfiguration.tsx`
    - Group controls into "Logistics" Card (sliders) and "Inclusion" Card (accessibility)
    - Implement auto-expansion of accessibility section based on classContext.possui_ane
    - Style "No Digital Resources" as "Low Tech Mode" switch
    - _Requirements: 5.1, 5.2, 5.3, 1.4_

  - [ ]* 7.2 Write property test for accessibility auto-expansion
    - **Property 5: Accessibility Auto-Expansion**
    - **Validates: Requirements 5.1**

- [x] 8. Implement Step 5: Review
  - [x] 8.1 Create StepReview component with summary and generation
    - Create `src/components/dashboard/wizard/StepReview.tsx`
    - Render SummaryCard for each section (Audience, Objectives, Strategy, Configuration)
    - Implement click-to-edit navigation for each summary
    - Add Generate button with AI processing icon
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 8.2 Write property test for review summary completeness
    - **Property 6: Review Summary Completeness**
    - **Validates: Requirements 6.1**

  - [ ]* 8.3 Write property test for summary navigation
    - **Property 7: Summary Navigation**
    - **Validates: Requirements 6.3**

- [x] 9. Checkpoint - Ensure step component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire up the new wizard flow
  - [x] 10.1 Update ContentWizard to use new step components and WizardProvider
    - Modify `src/components/dashboard/ContentWizard.tsx`
    - Wrap content with WizardProvider
    - Replace old step components with new ones
    - Update step configuration to use WIZARD_STEPS constant
    - Integrate ProgressHeader component
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 10.2 Write property test for step validation
    - **Property 10: Step Validation**
    - **Validates: Requirements 8.3**

- [x] 11. Clean up and finalize
  - [x] 11.1 Remove old step components (StepOne through StepFive)
    - Delete or archive old step files after confirming new flow works
    - Update any imports that reference old components
    - _Requirements: 1.1_
  
  - [x] 11.2 Update wizard data flow to generation functions
    - Ensure StepReview passes correct payload to generation edge functions
    - Map new state structure to existing API contracts
    - _Requirements: 6.2_

- [x] 12. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation preserves backward compatibility with existing generation edge functions
- All core implementation tasks are complete - only optional property tests remain
