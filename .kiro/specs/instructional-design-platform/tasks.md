# Implementation Plan: Instructional Design Platform

## Overview

This implementation plan transforms Educasol from a grading-focused platform into an AI-powered Instructional Design Platform. The plan builds on the existing React/TypeScript/Vite stack with Supabase backend and Shadcn UI components. Tasks are ordered to deliver incremental value, starting with core data models and the calendar dashboard, then building out generation capabilities.

## Tasks

- [x] 1. Set up core data models and validation schemas
  - [x] 1.1 Create lesson plan schema and validation
    - Create `src/lib/instructional/lesson-plan.ts`
    - Define `LessonPlanSchema` with Zod validation
    - Include phases, vocabulary, formative assessment fields
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x]* 1.2 Write property test for lesson plan schema round-trip
    - **Property 6: Lesson Plan Schema Round-Trip**
    - **Validates: Requirements 3.7**

  - [x] 1.3 Create unit plan schema and validation
    - Create `src/lib/instructional/unit-plan.ts`
    - Define `UnitPlanSchema` with duration and lesson outlines
    - Implement `validateUnitPlan()` function
    - _Requirements: 2.1, 2.3, 2.4_

  - [x]* 1.4 Write property test for unit plan duration consistency
    - **Property 4: Unit Plan Duration Consistency**
    - **Validates: Requirements 2.3, 2.4**

  - [x] 1.5 Create quiz schema and validation
    - Create `src/lib/instructional/quiz.ts`
    - Define `QuizSchema` with question types and Bloom's levels
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x]* 1.6 Write property tests for quiz structure
    - **Property 11: Quiz Question Bloom's Level**
    - **Property 12: Quiz Explanation Presence**
    - **Property 13: Quiz Schema Round-Trip**
    - **Validates: Requirements 5.2, 5.3, 5.5, 14.4**

  - [x] 1.7 Create worksheet schema and validation
    - Create `src/lib/instructional/worksheet.ts`
    - Define `WorksheetSchema` with section types
    - _Requirements: 6.2, 6.3, 6.4_

  - [x]* 1.8 Write property test for worksheet section validity
    - **Property 15: Worksheet Section Validity**
    - **Property 16: Worksheet Markdown Presence**
    - **Validates: Requirements 6.2, 6.3, 6.4**

  - [x] 1.9 Create leveled reading schema
    - Create `src/lib/instructional/leveled-reading.ts`
    - Define `LeveledReadingSchema` with three Lexile levels
    - _Requirements: 4.2, 4.4_

  - [x]* 1.10 Write property test for leveled reading structure
    - **Property 9: Leveled Reading Structure**
    - **Validates: Requirements 4.2, 4.4**

  - [x] 1.11 Create slide outline schema
    - Create `src/lib/instructional/slide-outline.ts`
    - Define `SlideOutlineSchema` with slide types
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x]* 1.12 Write property test for slide outline completeness
    - **Property 17: Slide Outline Completeness**
    - **Property 18: Slide Outline Schema Round-Trip**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

  - [x] 1.13 Create barrel export for instructional library
    - Create `src/lib/instructional/index.ts`
    - Export all schemas and validation functions
    - _Requirements: All schema requirements_

- [x] 2. Checkpoint - Ensure all schema tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create database migrations and Supabase setup
  - [x] 3.1 Create unit_plans table migration
    - Create migration for unit_plans table
    - Add indexes for user_id and date range queries
    - _Requirements: 2.1, 2.7, 13.1_

  - [x] 3.2 Create lesson_plans table migration
    - Create migration for lesson_plans with version tracking
    - Add indexes for search by topic, standard, date
    - _Requirements: 3.7, 13.1, 13.2, 13.4_

  - [x] 3.3 Create lesson_plan_versions table migration
    - Create migration for version history
    - Add trigger to auto-create version on update
    - _Requirements: 13.2_

  - [x] 3.4 Create generated_activities table migration
    - Create migration for quizzes, worksheets, readings, slides
    - Link to lesson_plans via foreign key
    - _Requirements: 13.1, 13.3_

  - [x] 3.5 Create standards table and seed data
    - Create migration for standards table
    - Add full-text search index
    - Seed with BNCC standards (primary market)
    - _Requirements: 11.1, 11.2, 11.4_

- [x] 4. Build Calendar Dashboard components
  - [x] 4.1 Create CalendarView component
    - Create `src/components/planner/CalendarView.tsx`
    - Use react-big-calendar for weekly/monthly views
    - Implement view toggle with localStorage persistence
    - _Requirements: 1.1, 1.5, 1.7_

  - [x]* 4.2 Write property test for calendar view preference round-trip
    - **Property 1: Calendar View Preference Round-Trip**
    - **Validates: Requirements 1.7**

  - [x] 4.3 Create LessonCard component
    - Create `src/components/planner/LessonCard.tsx`
    - Display topic, standards, status with visual distinction
    - Support drag-and-drop for rescheduling
    - _Requirements: 1.2, 1.4, 1.6_

  - [x]* 4.4 Write property tests for lesson card display
    - **Property 2: Lesson Card Display Completeness**
    - **Property 3: Lesson Status Visual Distinction**
    - **Validates: Requirements 1.2, 1.6**

  - [x] 4.5 Create CalendarSlot component
    - Create `src/components/planner/CalendarSlot.tsx`
    - Handle click to open lesson creation workflow
    - Show "+" button for empty slots
    - _Requirements: 1.3_

  - [x] 4.6 Create LessonPlanner page
    - Create `src/pages/Planner.tsx`
    - Integrate CalendarView as main content
    - Add sidebar for quick actions and unit context
    - _Requirements: 1.1_

- [x] 5. Build Unit Plan Creator
  - [x] 5.1 Create UnitPlanWizard component
    - Create `src/components/planner/UnitPlanWizard.tsx`
    - Multi-step form: inputs → standards → preview → confirm
    - _Requirements: 2.1, 2.5_

  - [x] 5.2 Create StandardsSelector component
    - Create `src/components/planner/StandardsSelector.tsx`
    - Searchable interface with grade/subject filters
    - Display full standard text on selection
    - _Requirements: 11.1, 11.2, 11.3_

  - [x]* 5.3 Write property tests for standards filtering
    - **Property 22: Standards Filter Accuracy**
    - **Property 23: Standards Display Completeness**
    - **Validates: Requirements 11.2, 11.3**

  - [x] 5.4 Create useUnitPlan hook
    - Create `src/hooks/useUnitPlan.ts`
    - Handle unit plan CRUD operations
    - Track modification timestamps
    - _Requirements: 2.7_

  - [x]* 5.5 Write property test for unit plan modification invariant
    - **Property 5: Unit Plan Modification Invariant**
    - **Validates: Requirements 2.7**

- [x] 6. Checkpoint - Ensure calendar and unit plan tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Build AI Generation infrastructure
  - [x] 7.1 Create Gemini API client
    - Create `src/lib/ai/gemini-client.ts`
    - Configure Gemini 1.5 Flash with system instruction
    - Implement streaming response handler
    - _Requirements: 9.1, 9.5_

  - [x] 7.2 Create generation Edge Function for lesson plans
    - Create `supabase/functions/generate-lesson-plan/index.ts`
    - Accept unit context and day number
    - Return streaming JSON response
    - _Requirements: 3.1, 3.2, 3.7_

  - [x] 7.3 Create generation Edge Function for quizzes
    - Create `supabase/functions/generate-quiz/index.ts`
    - Inherit lesson context automatically
    - Enforce Bloom's Taxonomy levels
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 7.4 Create generation Edge Function for worksheets
    - Create `supabase/functions/generate-worksheet/index.ts`
    - Extract vocabulary from lesson context
    - Generate cloze passages
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 7.5 Create generation Edge Function for leveled readings
    - Create `supabase/functions/generate-reading/index.ts`
    - Generate three Lexile levels simultaneously
    - _Requirements: 4.1, 4.2_

  - [x] 7.6 Create generation Edge Function for slide outlines
    - Create `supabase/functions/generate-slides/index.ts`
    - Include required slide types
    - Generate speaker notes
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 7.7 Create useGeneration hook
    - Create `src/hooks/useGeneration.ts`
    - Handle streaming responses
    - Manage loading and error states
    - _Requirements: 9.1, 9.4_

- [x] 8. Build Activity Generator UI
  - [x] 8.1 Create ActivityGeneratorModal component
    - Create `src/components/planner/ActivityGeneratorModal.tsx`
    - Activity type selector (quiz, worksheet, reading, slides)
    - Type-specific options
    - _Requirements: 5.1, 6.1, 7.1_

  - [x] 8.2 Create StreamingContent component
    - Create `src/components/planner/StreamingContent.tsx`
    - Display typing animation for streamed text
    - Show sparkle indicator during processing
    - _Requirements: 9.2, 9.3_

  - [x] 8.3 Create QuizPreview component
    - Create `src/components/planner/QuizPreview.tsx`
    - Display generated quiz with question cards
    - Show Bloom's level badges
    - _Requirements: 5.2, 5.3_

  - [x] 8.4 Create WorksheetPreview component
    - Create `src/components/planner/WorksheetPreview.tsx`
    - Display vocabulary matching, cloze sections
    - Render markdown content
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 8.5 Create LeveledReadingPreview component
    - Create `src/components/planner/LeveledReadingPreview.tsx`
    - Tab interface for easy/medium/hard levels
    - Show Lexile level badges
    - _Requirements: 4.2, 4.5_

  - [x] 8.6 Create SlideOutlinePreview component
    - Create `src/components/planner/SlideOutlinePreview.tsx`
    - Display slide cards with speaker notes
    - _Requirements: 7.1, 7.4_

- [x] 9. Build Differentiation Engine
  - [x] 9.1 Create DifferentiationPanel component
    - Create `src/components/planner/DifferentiationPanel.tsx`
    - Options for ELL, Advanced, ADHD, Visual
    - Preview before applying
    - _Requirements: 8.1_

  - [x] 9.2 Create differentiation Edge Function
    - Create `supabase/functions/differentiate-content/index.ts`
    - Preserve learning objective
    - Modify content based on type
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x]* 9.3 Write property tests for differentiation
    - **Property 19: Differentiation Preserves Objective**
    - **Property 20: Differentiation Schema Preservation**
    - **Validates: Requirements 8.5, 8.6**

- [x] 10. Build Content Refinement interface
  - [x] 10.1 Create RefinementToolbar component
    - Create `src/components/planner/RefinementToolbar.tsx`
    - Context menu on text selection
    - Rewrite, Simplify, Engage, Expand actions
    - _Requirements: 10.1, 10.2_

  - [x] 10.2 Create refinement Edge Function
    - Create `supabase/functions/refine-content/index.ts`
    - Modify only selected portion
    - _Requirements: 10.3_

  - [x] 10.3 Implement undo history
    - Add undo stack to content state
    - Support Ctrl+Z keyboard shortcut
    - _Requirements: 10.4_

  - [x]* 10.4 Write property test for refinement undo
    - **Property 21: Refinement Undo Round-Trip**
    - **Validates: Requirements 10.4**

  - [x] 10.5 Implement manual edit persistence
    - Create `src/hooks/useContentPersistence.ts`
    - Save changes on blur without regeneration
    - _Requirements: 10.5_

- [x] 11. Checkpoint - Ensure generation and refinement tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Build Export functionality
  - [x] 12.1 Create PDF export utility
    - Create `src/lib/instructional/export-pdf.ts`
    - Use jsPDF for generation
    - Apply consistent formatting
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 12.2 Create PPTX export utility
    - Create `src/lib/instructional/export-pptx.ts`
    - Use pptxgenjs for PowerPoint generation
    - _Requirements: 7.5, 12.3_

  - [x] 12.3 Create CSV export utility
    - Create `src/lib/instructional/export-csv.ts`
    - Export quiz questions and answers
    - _Requirements: 12.2_

  - [x] 12.4 Create ExportMenu component
    - Create `src/components/planner/ExportMenu.tsx`
    - Dropdown with format options
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 13. Build Data Persistence and History
  - [x] 13.1 Create useLessonPlan hook
    - Create `src/hooks/useLessonPlan.ts`
    - Handle CRUD with automatic timestamps
    - _Requirements: 13.1_

  - [x]* 13.2 Write property test for content persistence metadata
    - **Property 24: Content Persistence Metadata**
    - **Validates: Requirements 13.1**

  - [x] 13.3 Create version history UI
    - Create `src/components/planner/VersionHistory.tsx`
    - Display version list with timestamps
    - Support restore from version
    - _Requirements: 13.2_

  - [x]* 13.4 Write property test for version history
    - **Property 25: Lesson Plan Version History**
    - **Validates: Requirements 13.2**

  - [x] 13.5 Create search functionality
    - Add search bar to Planner page
    - Filter by topic, standard, date range
    - _Requirements: 13.4_

  - [x]* 13.6 Write property test for search relevance
    - **Property 27: Search Result Relevance**
    - **Validates: Requirements 13.4**

  - [x] 13.7 Implement soft delete
    - Archive instead of delete
    - Add "Show Archived" toggle
    - _Requirements: 13.5_

  - [x]* 13.8 Write property test for soft delete
    - **Property 28: Soft Delete Preservation**
    - **Validates: Requirements 13.5**

- [x] 14. Wire up lesson plan retrieval with activities
  - [x] 14.1 Create useLessonWithActivities hook
    - Create `src/hooks/useLessonWithActivities.ts`
    - Fetch lesson plan with all associated activities
    - _Requirements: 13.3_

  - [x]* 14.2 Write property test for retrieval completeness
    - **Property 26: Lesson Plan Retrieval Completeness**
    - **Validates: Requirements 13.3**

- [x] 15. Update navigation and routing
  - [x] 15.1 Update App routing
    - Add `/planner` route
    - Keep `/dashboard` for backward compatibility
    - _Requirements: 1.1_

  - [x] 15.2 Update Header navigation
    - Add "Planejador" as primary nav item
    - Move "Avaliações" to secondary position
    - _Requirements: 1.1_

- [x] 16. Final checkpoint - Complete platform verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify calendar dashboard loads correctly
  - Verify unit plan creation workflow
  - Verify activity generation for all types
  - Verify differentiation and refinement
  - Verify export functionality

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with React, Vite, and Tailwind CSS
- Testing framework: Vitest with fast-check for property-based tests
- AI integration uses Gemini 1.5 Flash via Supabase Edge Functions
