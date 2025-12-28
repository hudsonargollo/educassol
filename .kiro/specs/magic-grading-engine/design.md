# Design Document: Magic Grading Engine

## Overview

The Magic Grading Engine transforms the Educassol platform into an AI-powered assessment tool that enables educators to grade student submissions efficiently. The system provides a seamless workflow from submission upload through AI-powered grading to feedback delivery, featuring a modern split-pane interface with real-time streaming responses and smooth animations.

This design builds upon the existing assessment library (`src/lib/assessment/`) which provides rubric validation, grading result schemas, file validation, storage path generation, and access control utilities.

## Architecture

The Magic Grading Engine follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ GradingWorkstation│  │  RubricDesigner │  │ ResultViewer   │ │
│  │   (Split Pane)   │  │    (Wizard)     │  │  (Export)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Application Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  useGrading     │  │   useRubric     │  │ useSubmission  │ │
│  │    Hook         │  │     Hook        │  │    Hook        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Domain Layer                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              src/lib/assessment/                            ││
│  │  rubric.ts | grading-result.ts | file-validation.ts        ││
│  │  storage-path.ts | access-control.ts                       ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Supabase DB     │  │ Supabase Storage│  │ Edge Functions │ │
│  │ (PostgreSQL)    │  │ (File Uploads)  │  │ (AI Grading)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Rubric Designer Component

The RubricDesigner provides a wizard-style interface for creating and managing grading rubrics.

```typescript
interface RubricDesignerProps {
  examId: string;
  initialRubric?: Rubric;
  onSave: (rubric: Rubric) => void;
  onCancel: () => void;
}

interface RubricCriterionEditorProps {
  criterion: RubricQuestion;
  index: number;
  onChange: (criterion: RubricQuestion) => void;
  onRemove: () => void;
}
```

**Behavior:**
- Displays a form with title, description, and a dynamic list of criteria
- Each criterion has name, description, max points, expected answer, and keywords
- "Suggest Criteria" button calls AI to generate criteria based on question text
- Validates using existing `validateRubric()` from `src/lib/assessment/rubric.ts`
- Calculates total points automatically as sum of criteria max points

### 2. Submission Uploader Component

Handles file uploads with validation and progress feedback.

```typescript
interface SubmissionUploaderProps {
  examId: string;
  onUploadComplete: (submission: Submission) => void;
  onError: (error: string) => void;
}

interface UploadProgress {
  status: 'idle' | 'validating' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}
```

**Behavior:**
- Accepts drag-and-drop or file picker input
- Validates using existing `validateFile()` from `src/lib/assessment/file-validation.ts`
- Generates storage path using `generateStoragePath()` from `src/lib/assessment/storage-path.ts`
- Shows upload progress with animated progress bar
- Displays shimmer skeleton during processing

### 3. Grading Workstation Component

The core split-pane interface for viewing submissions and AI feedback.

```typescript
interface GradingWorkstationProps {
  submissionId: string;
  rubric: Rubric;
  onGradingComplete: (result: GradingResult) => void;
}

interface PDFViewerProps {
  fileUrl: string;
  annotations: Annotation[];
  onTextSelect: (selection: TextSelection) => void;
}

interface AIAssistantPanelProps {
  gradingResult: GradingResult | null;
  isStreaming: boolean;
  streamedText: string;
  onScoreOverride: (questionNumber: string, score: number) => void;
  onFeedbackEdit: (questionNumber: string, feedback: string) => void;
}
```

**Layout:**
- Uses `react-resizable-panels` for split-pane (already in dependencies)
- Left panel (50%): PDF/Image viewer with zoom/pan controls
- Right panel (50%): AI Assistant with streaming feedback
- Panels are resizable with persisted proportions via localStorage

### 4. Score Override Component

Allows educators to adjust AI-generated scores.

```typescript
interface ScoreOverrideProps {
  questionNumber: string;
  aiScore: number;
  maxPoints: number;
  overrideScore: number | null;
  onOverride: (score: number) => void;
}
```

**Behavior:**
- Displays slider from 0 to maxPoints
- Shows both AI score and override value
- Tracks override status for audit purposes
- Calculates final total using overrides where present

### 5. Result Viewer Component

Displays complete grading results with export capability.

```typescript
interface ResultViewerProps {
  result: GradingResult;
  rubric: Rubric;
  overrides: Map<string, number>;
  onExport: (format: 'pdf' | 'csv') => void;
}
```

## Data Models

### Extended Rubric Model (builds on existing)

```typescript
// Extends existing Rubric from src/lib/assessment/rubric.ts
interface RubricWithMetadata extends Rubric {
  id: string;
  examId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Submission Model

```typescript
interface Submission {
  id: string;
  examId: string;
  studentName: string;
  studentId: string;
  filePath: string;
  fileType: AllowedMimeType;
  uploadedAt: Date;
  status: 'pending' | 'grading' | 'graded' | 'error';
  extractedText?: string;
}
```

### Extended Grading Result (builds on existing)

```typescript
// Extends existing GradingResult from src/lib/assessment/grading-result.ts
interface GradingResultWithOverrides extends GradingResult {
  id: string;
  submissionId: string;
  rubricId: string;
  overrides: QuestionOverride[];
  finalScore: number;
  confidenceScore: number;
  gradedAt: Date;
  gradedBy: string;
}

interface QuestionOverride {
  questionNumber: string;
  originalScore: number;
  overrideScore: number;
  overrideReason?: string;
  overriddenAt: Date;
}
```

### Annotation Model

```typescript
interface Annotation {
  id: string;
  submissionId: string;
  questionNumber: string;
  type: 'highlight' | 'comment' | 'correction';
  content: string;
  location: AnnotationLocation;
  createdAt: Date;
}

interface AnnotationLocation {
  // For text-based submissions
  startOffset?: number;
  endOffset?: number;
  // For image-based submissions
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  pageNumber: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*



### Property 1: Rubric Criterion Validation

*For any* rubric criterion input, the validation function SHALL accept criteria with non-empty name, non-empty description, and positive max_points, and SHALL reject criteria missing any of these requirements.

**Validates: Requirements 1.2**

### Property 2: Rubric Total Points Invariant

*For any* valid rubric with one or more criteria, the total_points field SHALL equal the sum of all criteria max_points values.

**Validates: Requirements 1.4**

### Property 3: Grading Result Score Bounds

*For any* grading result, each question's points_awarded SHALL be less than or equal to its max_points value, and greater than or equal to zero.

**Validates: Requirements 3.2**

### Property 4: Grading Result Feedback Presence

*For any* grading result, each question SHALL have a non-empty feedback_for_student string.

**Validates: Requirements 3.3**

### Property 5: Confidence Score Range

*For any* grading result, the confidence score SHALL be a number between 0 and 100 inclusive.

**Validates: Requirements 3.5**

### Property 6: Annotation Structure Validity

*For any* annotation, it SHALL have a valid location (either text offsets for text submissions or coordinates for image submissions), a non-empty questionNumber referencing a criterion, and non-empty content.

**Validates: Requirements 4.2, 4.3, 4.4**

### Property 7: Override Bounds and Preservation

*For any* score override, the override value SHALL be between 0 and the criterion's max_points inclusive, and both the original AI score and override value SHALL be preserved.

**Validates: Requirements 5.1, 5.2, 5.5**

### Property 8: Final Score Calculation with Overrides

*For any* grading result with overrides, the final total score SHALL equal the sum of: override values for overridden questions, plus AI scores for non-overridden questions.

**Validates: Requirements 5.3**

### Property 9: Grading Result Round-Trip

*For any* valid grading result, serializing then deserializing SHALL produce an equivalent grading result object.

**Validates: Requirements 6.1, 6.2**

### Property 10: Panel Proportion Persistence Round-Trip

*For any* valid panel proportion value (between 0.1 and 0.9), saving to localStorage then retrieving SHALL return the same proportion value.

**Validates: Requirements 8.2**

## Error Handling

### Validation Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| InvalidRubric | Rubric fails schema validation | Return validation errors with field paths |
| InvalidCriterion | Criterion missing required fields | Highlight invalid fields in UI |
| FileTooLarge | File exceeds 10MB | Show error with size limit |
| UnsupportedFileType | MIME type not in allowed list | Show error with supported formats |
| InvalidOverride | Override value out of bounds | Clamp to valid range with warning |

### Processing Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| OCRFailure | Cannot extract text from image | Return partial result, flag affected questions |
| AITimeout | AI response exceeds timeout | Retry with exponential backoff, max 3 attempts |
| StorageError | File upload fails | Show retry option with error details |

### Access Control Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| Unauthorized | User lacks required role | Return 403 with "Access denied" message |
| NotOwner | Educator doesn't own exam | Return 403 with "Not authorized" message |
| NotFound | Resource doesn't exist | Return 404 with "Not found" message |

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

- Rubric validation with edge cases (empty strings, zero points, negative points)
- File validation with boundary sizes (exactly 10MB, 10MB + 1 byte)
- Score override with boundary values (0, max_points, out of bounds)
- Access control with various role combinations

### Property-Based Tests

Property-based tests verify universal properties using `fast-check` (already in devDependencies):

- **Minimum 100 iterations per property test**
- Each test references its design document property
- Tag format: **Feature: magic-grading-engine, Property {number}: {property_text}**

### Existing Tests to Leverage

The codebase already has property tests in `src/lib/assessment/__tests__/`:

- `rubric.property.test.ts` - Rubric validation properties
- `grading-result.property.test.ts` - Grading result serialization round-trip
- `file-validation.property.test.ts` - File type and size validation
- `storage-path.property.test.ts` - Storage path generation
- `access-control.test.ts` - Access control logic

### New Tests Required

| Property | Test File | Description |
|----------|-----------|-------------|
| Property 3 | `grading-result.property.test.ts` | Add score bounds validation |
| Property 4 | `grading-result.property.test.ts` | Add feedback presence validation |
| Property 5 | `grading-result.property.test.ts` | Add confidence score range validation |
| Property 6 | `annotation.property.test.ts` | New file for annotation validation |
| Property 7 | `override.property.test.ts` | New file for override validation |
| Property 8 | `override.property.test.ts` | Final score calculation with overrides |
| Property 10 | `panel-persistence.property.test.ts` | Panel proportion round-trip |

## UI Component Specifications

### Animation Configuration

```typescript
// lib/motion.ts
export const EDUCASSOL_SPRING = { 
  type: "spring", 
  stiffness: 300, 
  damping: 30 
};

export const EDUCASSOL_EASE = { 
  duration: 0.5, 
  ease: [0.22, 1, 0.36, 1] 
};

export const STAGGER_PARENT = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
  }
};

export const FADE_UP_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 260, damping: 20 } 
  }
};
```

### Color Tokens

```typescript
// lib/colors.ts
export const EDUCASSOL_COLORS = {
  primary: '#2563EB',      // Educassol Blue - main actions
  secondary: '#F1F5F9',    // Page backgrounds
  accent: '#F59E0B',       // Innovation Amber - AI triggers
  textMain: '#0F172A',     // Deep Navy - headlines
  textMuted: '#64748B',    // Labels, meta-data
  border: '#E2E8F0',       // Dividers, inputs
  success: '#10B981',      // Success Emerald - completed grades
  error: '#E11D48',        // Alert Rose - errors
};
```

### Grading Workstation Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Exam Title | Student Name | Status Badge              │
├─────────────────────────────────┬───────────────────────────────┤
│                                 │                               │
│   PDF/Image Viewer              │   AI Assistant Panel          │
│   ┌─────────────────────────┐   │   ┌───────────────────────┐   │
│   │                         │   │   │ Grading Progress      │   │
│   │   [Zoom] [Pan] [Page]   │   │   │ ████████░░ 80%        │   │
│   │                         │   │   └───────────────────────┘   │
│   │   Student Submission    │   │   ┌───────────────────────┐   │
│   │   with Annotations      │   │   │ Question 1            │   │
│   │                         │   │   │ Score: [====|===] 7/10│   │
│   │                         │   │   │ Feedback: ...         │   │
│   │                         │   │   └───────────────────────┘   │
│   │                         │   │   ┌───────────────────────┐   │
│   │                         │   │   │ Question 2            │   │
│   │                         │   │   │ Score: [========] 10/10│  │
│   │                         │   │   │ Feedback: ...         │   │
│   └─────────────────────────┘   │   └───────────────────────┘   │
│                                 │                               │
│   ◀─────── Resizable ───────▶   │   Confidence: 95% ✨          │
│                                 │   [Override] [Save] [Export]  │
├─────────────────────────────────┴───────────────────────────────┤
│  Footer: Total Score: 17/20 | Graded by AI | Override: 2 items │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Rubric Management

```
POST   /api/rubrics              - Create new rubric
GET    /api/rubrics/:id          - Get rubric by ID
PUT    /api/rubrics/:id          - Update rubric
DELETE /api/rubrics/:id          - Delete rubric (if no references)
POST   /api/rubrics/suggest      - AI-suggest criteria from question text
```

### Submission Management

```
POST   /api/submissions          - Upload submission file
GET    /api/submissions/:id      - Get submission details
GET    /api/submissions/:id/file - Get submission file URL
```

### Grading

```
POST   /api/grading/start        - Initiate AI grading (returns streaming response)
GET    /api/grading/:id          - Get grading result
PUT    /api/grading/:id/override - Apply score override
POST   /api/grading/:id/export   - Export grading result
```
