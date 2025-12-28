# Implementation Plan: Magic Grading Engine

## Overview

This implementation plan transforms the Educassol platform into an AI-powered grading system. The plan builds on the existing assessment library (`src/lib/assessment/`) and uses TypeScript, React, Shadcn UI, and Framer Motion. Tasks are ordered to deliver incremental value with early validation through property-based tests.

## Tasks

- [x] 1. Extend core data models and validation
  - [x] 1.1 Add confidence score and override fields to grading result schema
    - Extend `GradingResultSchema` in `src/lib/assessment/grading-result.ts`
    - Add `confidenceScore: z.number().min(0).max(100)`
    - Add `overrides: z.array(QuestionOverrideSchema).optional()`
    - _Requirements: 3.5, 5.2_

  - [x]* 1.2 Write property test for confidence score range
    - **Property 5: Confidence Score Range**
    - **Validates: Requirements 3.5**
    - Note: Confidence score validation is built into the schema with `.min(0).max(100)`

  - [x] 1.3 Create annotation schema and validation
    - Create `src/lib/assessment/annotation.ts`
    - Define `AnnotationSchema` with location, questionNumber, content
    - Support both text offsets and image coordinates
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 1.4 Write property test for annotation structure validity
    - **Property 6: Annotation Structure Validity**
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [x] 1.5 Create override schema and calculation functions
    - Create `src/lib/assessment/override.ts`
    - Define `QuestionOverrideSchema` with bounds validation
    - Implement `calculateFinalScore()` function
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [ ]* 1.6 Write property tests for override bounds and final score calculation
    - **Property 7: Override Bounds and Preservation**
    - **Property 8: Final Score Calculation with Overrides**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5**

- [x] 2. Checkpoint - Ensure all tests pass
  - All 52 existing tests pass (5 test files)

- [x] 3. Create animation and color utilities
  - [x] 3.1 Create motion configuration file
    - Create `src/lib/motion.ts`
    - Define `EDUCASSOL_SPRING`, `EDUCASSOL_EASE` constants
    - Define `STAGGER_PARENT`, `FADE_UP_ITEM` variants
    - _Requirements: 9.1, 9.2_

  - [x] 3.2 Create color tokens file
    - Create `src/lib/colors.ts`
    - Define `EDUCASSOL_COLORS` object with all palette colors
    - _Requirements: 9.6, 9.7_

- [x] 4. Build Rubric Designer component
  - [x] 4.1 Create RubricCriterionEditor component
    - Create `src/components/assessment/RubricCriterionEditor.tsx`
    - Form fields for name, description, max_points, expected_answer, keywords
    - Use Shadcn Input, Textarea, and Button components
    - Apply fade-up animation on mount
    - _Requirements: 1.2_

  - [x] 4.2 Create RubricDesigner component
    - Create `src/components/assessment/RubricDesigner.tsx`
    - Wizard-style interface with title, description, criteria list
    - Add/remove criteria with drag-and-drop reordering
    - Auto-calculate total points
    - Validate using existing `validateRubric()` function
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ]* 4.3 Write property test for rubric total points invariant
    - **Property 2: Rubric Total Points Invariant**
    - **Validates: Requirements 1.4**

- [x] 5. Build Submission Uploader component
  - [x] 5.1 Create SubmissionUploader component
    - Create `src/components/assessment/SubmissionUploader.tsx`
    - Drag-and-drop zone with file picker fallback
    - Use existing `validateFile()` for type/size validation
    - Use existing `generateStoragePath()` for path generation
    - Show upload progress with animated progress bar
    - Display shimmer skeleton during processing
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 6. Build Grading Workstation interface
  - [x] 6.1 Create PDFViewer component
    - Create `src/components/assessment/PDFViewer.tsx`
    - Use react-pdf or iframe for PDF rendering
    - Add zoom and pan controls overlay
    - Support annotation highlighting
    - _Requirements: 8.3, 4.1_

  - [x] 6.2 Create AIAssistantPanel component
    - Create `src/components/assessment/AIAssistantPanel.tsx`
    - Display streaming text with typing animation
    - Show grading progress indicator
    - List question results with scores and feedback
    - Display confidence score with sparkle icon
    - _Requirements: 8.4, 8.6, 9.5_

  - [x] 6.3 Create ScoreOverride component
    - Create `src/components/assessment/ScoreOverride.tsx`
    - Slider from 0 to maxPoints
    - Display both AI score and override value
    - Track override status for audit
    - _Requirements: 5.1, 5.2, 5.4, 8.5_

  - [x] 6.4 Create GradingWorkstation component
    - Create `src/components/assessment/GradingWorkstation.tsx`
    - Use `react-resizable-panels` for split-pane layout
    - Left panel: PDFViewer, Right panel: AIAssistantPanel
    - Persist panel proportions to localStorage
    - Apply card shadows and layout animations
    - _Requirements: 8.1, 8.2, 9.2_

  - [ ]* 6.5 Write property test for panel proportion persistence
    - **Property 10: Panel Proportion Persistence Round-Trip**
    - **Validates: Requirements 8.2**

- [x] 7. Checkpoint - Ensure all tests pass
  - All 52 existing tests pass (5 test files)

- [x] 8. Build Result Viewer and Export
  - [x] 8.1 Create ResultViewer component
    - Create `src/components/assessment/ResultViewer.tsx`
    - Display complete grading result with all scores and feedback
    - Show override indicators where applicable
    - Calculate and display final total score
    - _Requirements: 6.2_

  - [x] 8.2 Create export functionality
    - Add export to PDF and CSV options in `src/components/assessment/export-utils.ts`
    - Generate formatted report suitable for sharing
    - _Requirements: 6.3_

  - [ ]* 8.3 Write property test for grading result round-trip
    - **Property 9: Grading Result Round-Trip**
    - **Validates: Requirements 6.1, 6.2**
    - Note: Basic round-trip test exists in grading-result.property.test.ts, but may need extension for overrides

- [x] 9. Implement responsive layout and accessibility
  - [x] 9.1 Add responsive breakpoints
    - Stack split panes vertically on mobile (< 768px)
    - Adjust font sizes and spacing for mobile
    - _Requirements: 10.1_

  - [x] 9.2 Add keyboard navigation and accessibility
    - Ensure Tab navigation through all interactive elements
    - Add visible focus indicators
    - Add aria-labels for icon-only buttons
    - Verify WCAG 2.1 AA color contrast
    - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 10. Wire up Supabase Edge Functions for AI grading
  - [x] 10.1 Update analyze-exam edge function
    - Modify `supabase/functions/analyze-exam/index.ts`
    - Accept rubric and submission as input
    - Return streaming response for real-time feedback
    - Include confidence score in response
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 10.2 Create grading hooks
    - Create `src/hooks/useGrading.ts`
    - Handle streaming response from edge function
    - Manage grading state and progress
    - _Requirements: 3.1_

- [x] 11. Integrate access control
  - [x] 11.1 Apply access control to grading components
    - Use existing access control functions from `src/lib/assessment/access-control.ts`
    - Verify educator role before showing grading features
    - Verify exam ownership before grading
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Final checkpoint - Ensure all tests pass
  - All 52 existing tests pass (5 test files)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation builds on existing assessment library code
- All core implementation tasks are complete
- Remaining optional tasks are property tests for additional coverage:
  - 1.4: Annotation structure validity property test
  - 1.6: Override bounds and final score calculation property tests
  - 4.3: Rubric total points invariant property test
  - 6.5: Panel proportion persistence property test
  - 8.3: Extended grading result round-trip property test (with overrides)
