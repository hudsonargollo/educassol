# Requirements Document: Resource Creation Wizard UX Overhaul

## Introduction

This specification defines the requirements for redesigning the "Content Wizard" in Educasol. The current implementation suffers from uneven distribution of complexity (specifically in Step 3), leading to cognitive overload for educators. The goal is to restructure the resource creation flow into clear, balanced, and logically grouped steps, creating a "comprehensive and easy to cope with" experience that guides the teacher from context to content to strategy.

## Glossary

- **Wizard_Flow**: The linear progression of steps (screens) the user navigates to create content.
- **Context_Step**: The phase where the target audience (Class/Grade) and Subject are defined.
- **Content_Step**: The phase where the instructional topic and curriculum standards (BNCC) are selected.
- **Strategy_Step**: The phase where pedagogical methodologies, templates, and specific teacher ideas are input.
- **Logistics_Step**: The phase for defining constraints like duration, class size, and inclusion needs.
- **Smart_Defaults**: The system behavior of auto-populating fields (e.g., student count) based on previously selected Context (e.g., Class).
- **BNCC**: Brazilian National Common Curricular Base - the curriculum standards framework.
- **ANE**: Students with special educational needs (Alunos com Necessidades Especiais).

## Requirements

### Requirement 1: Balanced Step Distribution

**User Story:** As an educator, I want the planning process broken down into balanced, logical chunks so that I am not overwhelmed by too many decisions on a single screen.

#### Acceptance Criteria

1. THE Wizard_Flow SHALL be reorganized into exactly 5 distinct logical steps:
   - Step 1: Context (Class, Grade, Subject)
   - Step 2: Objectives (Topic, Standards/BNCC)
   - Step 3: Strategy (Methodologies, Templates, Specific Ideas)
   - Step 4: Configuration (Logistics, Inclusion/Accessibility)
   - Step 5: Review (Summary & Generation)
2. THE Wizard_Flow SHALL move "BNCC Selection" from the current mixed configuration step to the Objectives step.
3. THE Wizard_Flow SHALL move "Methodologies" and "Templates" to the Strategy step.
4. THE Wizard_Flow SHALL move "Accessibility/Inclusion" and duration/student sliders to the Configuration step.

### Requirement 2: Smart Context Selection

**User Story:** As an educator, I want the system to automatically configure the grade and subject if I select an existing class, so that I don't have to enter redundant information.

#### Acceptance Criteria

1. WHEN an educator selects an existing Class from the dropdown, THE Context_Step SHALL automatically set the Grade and Subject based on the class metadata.
2. IF a Class is selected, THE Context_Step SHALL automatically populate the classContext (total students, ANE details) for use in later steps.
3. THE Context_Step SHALL allow "Manual Mode" selection of Grade and Subject only if no Class is selected.
4. THE Context_Step SHALL visually combine Class/Grade and Subject selection into a single cohesive step using a split-pane or conditional render approach.

### Requirement 3: Integrated Objectives and Standards

**User Story:** As an educator, I want to see curriculum standards immediately after defining my topic, so that I can ensure alignment before choosing teaching methods.

#### Acceptance Criteria

1. THE Content_Step SHALL allow the user to input the Topic (Theme).
2. WHEN the Topic is input, THE Content_Step SHALL automatically trigger the "Suggest BNCC" AI call in the background (debounced) or provide a prominent "Find Standards" button adjacent to the input.
3. THE Content_Step SHALL display selected BNCC standards as chips or tags directly below the topic input, allowing easy removal.
4. THE Wizard_Flow SHALL prevent proceeding to Step 3 if a Topic is not defined.

### Requirement 4: Visual Strategy Selection

**User Story:** As an educator, I want to select teaching methodologies and templates visually, so that I can quickly understand the structure of the lesson I am building.

#### Acceptance Criteria

1. THE Strategy_Step SHALL display Methodologies (e.g., PBL, Gamification) as selectable cards with icons and brief descriptions, rather than a simple checkbox list.
2. THE Strategy_Step SHALL include the Template_Selector rendered as a visual carousel or grid of layouts.
3. THE Strategy_Step SHALL include the Specific Idea textarea, framed as "Teacher Notes" or "Custom Instructions" for the AI.

### Requirement 5: Intelligent Configuration and Inclusion

**User Story:** As an educator, I want accessible options to be presented clearly, with defaults set based on my class profile.

#### Acceptance Criteria

1. IF a Class with special needs students (possui_ane) was selected in Step 1, THE Logistics_Step SHALL auto-expand the Accessibility section and pre-select relevant options.
2. THE Logistics_Step SHALL group configuration controls into "Logistics" (Time, Class Size) and "Inclusion" (Accessibility Checklist) sections.
3. THE Logistics_Step SHALL display the "No Digital Resources" toggle as a visually distinct "Low Tech Mode" switch.

### Requirement 6: Review and Preview

**User Story:** As an educator, I want to review my choices before the final generation, so that I don't waste time generating content with incorrect settings.

#### Acceptance Criteria

1. THE Review_Step SHALL display a summary card containing: Target Audience, Topic/Standards, Methodology, and Logistics.
2. THE Review_Step SHALL contain the primary "Generate" button, labeled clearly with an icon indicating AI processing.
3. THE Review_Step SHALL allow clicking on any summary item to jump back to the specific edit step.

### Requirement 7: Wizard State Management

**User Story:** As an educator, I want my progress to be preserved if I accidentally close the wizard, so that I don't lose my work.

#### Acceptance Criteria

1. THE Wizard_Flow SHALL use centralized state management (WizardContext) to replace prop drilling between steps.
2. THE Wizard_Flow SHALL persist draft state to localStorage when the dialog is closed.
3. WHEN the wizard is reopened, THE Wizard_Flow SHALL restore the previously saved draft state.

### Requirement 8: Progress Indication and Navigation

**User Story:** As an educator, I want clear visual feedback on my progress through the wizard steps.

#### Acceptance Criteria

1. THE Wizard_Flow SHALL display a progress bar at the top showing the current step position.
2. THE Wizard_Flow SHALL display text labels for the current phase (e.g., "Defining Objectives").
3. THE Wizard_Flow SHALL disable "Next" buttons until required fields are completed.
4. THE Wizard_Flow SHALL allow navigation back to previous steps without losing entered data.
