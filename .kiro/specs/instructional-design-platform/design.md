# Design Document: Instructional Design Platform

## Overview

The Instructional Design Platform transforms Educasol from a grading-focused tool into an AI-powered "Command Center" for educators. The system integrates curriculum mapping, daily lesson planning, and resource generation into a unified workflow powered by Gemini 1.5 Flash. The architecture prioritizes low-latency interactions ("Click-to-Create" vs "Chat-to-Create"), contextual awareness through the 1M token context window, and strict JSON schema enforcement for reliable UI rendering.

## Architecture

The platform follows a layered architecture with the Calendar as the central hub:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ LessonPlanner   │  │ ActivityCreator │  │ DifferentiationPanel   │  │
│  │ (Calendar Hub)  │  │ (Resource Gen)  │  │ (Content Adaptation)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                         Application Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ useCalendar     │  │ useGeneration   │  │ useDifferentiation     │  │
│  │ Hook            │  │ Hook            │  │ Hook                   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                         Domain Layer                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                    src/lib/instructional/                           ││
│  │  lesson-plan.ts | unit-plan.ts | quiz.ts | worksheet.ts            ││
│  │  standards.ts | differentiation.ts | export.ts                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                         AI Layer                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Gemini 1.5 Flash API (1M context, JSON schema enforcement)        ││
│  │  Context Caching | Streaming Responses | System Instructions       ││
│  └─────────────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│                         Infrastructure Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Supabase DB     │  │ Supabase Storage│  │ Edge Functions         │  │
│  │ (PostgreSQL)    │  │ (Exports)       │  │ (AI Generation)        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Lesson Planner (Calendar Dashboard)

The central hub component using react-big-calendar for the calendar view.

```typescript
interface LessonPlannerProps {
  userId: string;
  defaultView?: 'week' | 'month';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  lessonPlan?: LessonPlan;
  status: 'planned' | 'in-progress' | 'completed';
  standards: string[];
}

interface CalendarSlotProps {
  date: Date;
  period?: string;
  onCreateLesson: () => void;
}
```

### 2. Unit Plan Creator

Wizard-style interface for creating multi-day unit plans.

```typescript
interface UnitPlanCreatorProps {
  onComplete: (unitPlan: UnitPlan) => void;
  onCancel: () => void;
}

interface UnitPlanInputs {
  gradeLevel: string;
  subject: string;
  topic: string;
  standards: string[];
  durationDays: number;
  startDate: Date;
}
```

### 3. Activity Generator Panel

Contextual panel for generating resources from lesson context.

```typescript
interface ActivityGeneratorProps {
  lessonContext: LessonPlan;
  onGenerate: (activity: GeneratedActivity) => void;
}

type ActivityType = 'quiz' | 'worksheet' | 'reading' | 'slides';

interface GeneratedActivity {
  type: ActivityType;
  content: Quiz | Worksheet | LeveledReading | SlideOutline;
  generatedAt: Date;
}
```

### 4. Differentiation Panel

Toolbar for adapting content for diverse learners.

```typescript
interface DifferentiationPanelProps {
  content: LessonPlan | GeneratedActivity;
  onDifferentiate: (modified: DifferentiatedContent) => void;
}

type DifferentiationType = 'ell' | 'advanced' | 'adhd' | 'visual';

interface DifferentiatedContent {
  original: LessonPlan | GeneratedActivity;
  modifications: DifferentiationType[];
  adapted: LessonPlan | GeneratedActivity;
}
```

### 5. Content Refinement Toolbar

Context menu for inline content editing.

```typescript
interface RefinementToolbarProps {
  selectedText: string;
  position: { x: number; y: number };
  onRefine: (action: RefinementAction, result: string) => void;
}

type RefinementAction = 'rewrite' | 'simplify' | 'engage' | 'expand';
```

### 6. Standards Selector

Searchable interface for curriculum standards.

```typescript
interface StandardsSelectorProps {
  framework: 'bncc' | 'common-core' | 'teks';
  gradeLevel?: string;
  subject?: string;
  onSelect: (standards: Standard[]) => void;
}

interface Standard {
  code: string;
  text: string;
  gradeLevel: string;
  subject: string;
  subStandards?: Standard[];
}
```

## Data Models

### LessonPlan Schema

```typescript
interface LessonPlan {
  id: string;
  unitId?: string;
  date: Date;
  topic: string;
  gradeLevel: string;
  subject: string;
  duration: number; // minutes
  standards: string[];
  
  learningObjective: string; // SWBAT statement, Bloom's aligned
  
  keyVocabulary: Array<{
    term: string;
    definition: string;
  }>;
  
  materialsNeeded: string[];
  
  phases: Array<{
    type: 'hook' | 'direct-instruction' | 'guided-practice' | 'independent-practice' | 'closure';
    name: string;
    duration: number; // minutes
    teacherScript: string;
    studentAction: string;
    differentiationNotes?: {
      support: string;
      extension: string;
    };
  }>;
  
  formativeAssessment: {
    type: 'exit-ticket' | 'quick-check' | 'observation';
    question: string;
  };
  
  status: 'draft' | 'planned' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### UnitPlan Schema

```typescript
interface UnitPlan {
  id: string;
  title: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  standards: string[];
  durationDays: number;
  startDate: Date;
  endDate: Date;
  
  subSkills: Array<{
    skill: string;
    standard: string;
    dayNumber: number;
  }>;
  
  lessonOutlines: Array<{
    dayNumber: number;
    date: Date;
    topic: string;
    objective: string;
    lessonPlanId?: string; // linked when full plan is generated
  }>;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Quiz Schema

```typescript
interface Quiz {
  id: string;
  lessonPlanId: string;
  title: string;
  instructions: string;
  
  questions: Array<{
    id: number;
    text: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctOptionIndex?: number;
    correctAnswer?: string;
    explanation: string;
    bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  }>;
  
  createdAt: Date;
}
```

### LeveledReading Schema

```typescript
interface LeveledReading {
  id: string;
  lessonPlanId: string;
  topic: string;
  
  passages: {
    easy: {
      text: string;
      lexileLevel: number; // e.g., 500
    };
    medium: {
      text: string;
      lexileLevel: number; // e.g., 800
    };
    hard: {
      text: string;
      lexileLevel: number; // e.g., 1100
    };
  };
  
  coreConceptsPreserved: string[];
  createdAt: Date;
}
```

### Worksheet Schema

```typescript
interface Worksheet {
  id: string;
  lessonPlanId: string;
  title: string;
  
  sections: Array<{
    type: 'vocabulary-matching' | 'cloze' | 'diagram-labeling' | 'short-answer';
    instructions: string;
    content: VocabularyMatching | ClozePassage | DiagramLabeling | ShortAnswerSection;
  }>;
  
  markdownContent: string; // for PDF export
  createdAt: Date;
}

interface VocabularyMatching {
  terms: Array<{ term: string; definition: string }>;
}

interface ClozePassage {
  text: string; // with _____ blanks
  answers: string[];
}

interface DiagramLabeling {
  imageDescription: string;
  labels: Array<{ position: string; answer: string }>;
}

interface ShortAnswerSection {
  questions: Array<{ question: string; expectedAnswer: string }>;
}
```

### SlideOutline Schema

```typescript
interface SlideOutline {
  id: string;
  lessonPlanId: string;
  title: string;
  
  slides: Array<{
    slideNumber: number;
    type: 'title' | 'agenda' | 'concept' | 'example' | 'activity' | 'summary';
    title: string;
    bulletPoints: string[];
    speakerNotes: string;
    visualSuggestion?: string;
  }>;
  
  createdAt: Date;
}
```

## Gemini 1.5 Flash Integration

### System Instruction

```
You are Educasol AI, an expert instructional coach and curriculum developer.
Your goal is to reduce teacher workload while maintaining high pedagogical rigor.

ALWAYS follow Universal Design for Learning (UDL) principles.
ALWAYS align strictly to the provided State Standards.
If the user provides a standard, do not deviate from it.

Output must be valid JSON matching the requested schema.
Do not include "markdown" formatting blocks in the JSON output, just the raw JSON.

When generating lesson plans:
- Use the 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate)
- Align learning objectives to Bloom's Taxonomy
- Include differentiation notes for diverse learners

When generating assessments:
- Target "Apply" and "Analyze" levels of Bloom's Taxonomy
- Avoid simple recall questions
- Generate plausible distractors based on common misconceptions

Tone: Professional, Encouraging, Concise.
```

### API Configuration

```typescript
const geminiConfig = {
  model: 'models/gemini-1.5-flash-latest',
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 8192,
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],
};
```

### Context Caching Strategy

For educators working on a unit over multiple sessions:
1. Cache the unit context (standards, previous lessons, textbook excerpts) on first request
2. Reference cache ID for subsequent requests within the same unit
3. Set cache TTL to match typical session length (2 hours)
4. Invalidate cache when unit is modified

</text>
</invoke>


## Error Handling

### Validation Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| InvalidUnitPlan | Unit plan missing required fields | Return validation errors with field paths |
| InvalidLessonPlan | Lesson plan fails schema validation | Highlight invalid fields in UI |
| InvalidStandard | Standard code not found in database | Show error with suggestion for similar codes |
| InvalidDateRange | Unit duration exceeds 30 days | Show warning with recommendation to split |

### AI Generation Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| GenerationTimeout | AI response exceeds 30 seconds | Retry with exponential backoff, max 3 attempts |
| SchemaViolation | AI returns invalid JSON | Retry with stricter schema prompt |
| ContentFiltered | Safety filter triggered | Return generic content with warning |
| ContextOverflow | Context exceeds token limit | Summarize older context, retry |

### Persistence Errors

| Error Type | Condition | Response |
|------------|-----------|----------|
| SaveFailed | Database write fails | Show retry option, queue for offline sync |
| VersionConflict | Concurrent edit detected | Show diff and merge options |
| ExportFailed | File generation fails | Show error with format-specific guidance |

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

- Calendar view rendering with various lesson statuses
- Unit plan creation with boundary durations (1 day, 30 days)
- Quiz generation with each question type
- Export functionality for each format
- Standards search with various query patterns

### Property-Based Tests

Property-based tests verify universal properties using `fast-check`:

- **Minimum 100 iterations per property test**
- Each test references its design document property
- Tag format: **Feature: instructional-design-platform, Property {number}: {property_text}**

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Calendar View Preference Round-Trip

*For any* valid calendar view preference ('week' or 'month'), saving to localStorage then retrieving SHALL return the same view preference.

**Validates: Requirements 1.7**

### Property 2: Lesson Card Display Completeness

*For any* lesson plan with topic, standards, and status fields, the rendered calendar card SHALL contain all three pieces of information.

**Validates: Requirements 1.2**

### Property 3: Lesson Status Visual Distinction

*For any* lesson status ('planned', 'in-progress', 'completed'), the rendered card SHALL have a distinct CSS class or styling attribute for that status.

**Validates: Requirements 1.6**

### Property 4: Unit Plan Duration Consistency

*For any* valid unit plan with durationDays N, the lessonOutlines array SHALL contain exactly N entries, and each entry SHALL have a unique dayNumber from 1 to N.

**Validates: Requirements 2.3, 2.4**

### Property 5: Unit Plan Modification Invariant

*For any* unit plan modification, the unit ID SHALL remain unchanged and the updatedAt timestamp SHALL be greater than the previous updatedAt value.

**Validates: Requirements 2.7**

### Property 6: Lesson Plan Schema Round-Trip

*For any* valid LessonPlan object, serializing to JSON then deserializing SHALL produce an equivalent LessonPlan object.

**Validates: Requirements 3.7**

### Property 7: Lesson Plan Structure Completeness

*For any* generated lesson plan, it SHALL have a non-empty learningObjective, at least one phase with duration/teacherScript/studentAction, at least one keyVocabulary entry with term/definition, and a formativeAssessment with type/question.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Property 8: Lesson Plan Phase Model Compliance

*For any* generated lesson plan, the phases array SHALL contain phases that map to the 5E model types ('hook', 'direct-instruction', 'guided-practice', 'independent-practice', 'closure').

**Validates: Requirements 3.2**

### Property 9: Leveled Reading Structure

*For any* generated leveled reading, it SHALL have passages.easy, passages.medium, and passages.hard fields, each with non-empty text and distinct lexileLevel values where easy.lexileLevel < medium.lexileLevel < hard.lexileLevel.

**Validates: Requirements 4.2, 4.4**

### Property 10: Quiz Context Inheritance

*For any* quiz generated from a lesson plan, the quiz.lessonPlanId SHALL match the source lesson plan's ID.

**Validates: Requirements 5.1**

### Property 11: Quiz Question Bloom's Level

*For any* quiz question, the bloomLevel SHALL be one of 'apply', 'analyze', 'evaluate', or 'create' (not 'remember' or 'understand').

**Validates: Requirements 5.2, 14.4**

### Property 12: Quiz Explanation Presence

*For any* quiz question, the explanation field SHALL be a non-empty string.

**Validates: Requirements 5.3**

### Property 13: Quiz Schema Round-Trip

*For any* valid Quiz object, serializing to JSON then deserializing SHALL produce an equivalent Quiz object.

**Validates: Requirements 5.5**

### Property 14: Worksheet Vocabulary Derivation

*For any* worksheet generated from a lesson plan, the vocabulary matching section terms SHALL be a subset of the lesson plan's keyVocabulary terms.

**Validates: Requirements 6.1**

### Property 15: Worksheet Section Validity

*For any* worksheet section of type 'vocabulary-matching', it SHALL have a terms array with term/definition pairs. For type 'cloze', it SHALL have text with blanks and matching answers array. For type 'short-answer', it SHALL have questions array.

**Validates: Requirements 6.2, 6.3**

### Property 16: Worksheet Markdown Presence

*For any* generated worksheet, the markdownContent field SHALL be a non-empty string.

**Validates: Requirements 6.4**

### Property 17: Slide Outline Completeness

*For any* generated slide outline, the slides array SHALL contain at least one slide of type 'title', at least one of type 'concept', and at least one of type 'summary'. Each slide SHALL have non-empty speakerNotes.

**Validates: Requirements 7.1, 7.2, 7.4**

### Property 18: Slide Outline Schema Round-Trip

*For any* valid SlideOutline object, serializing to JSON then deserializing SHALL produce an equivalent SlideOutline object.

**Validates: Requirements 7.3**

### Property 19: Differentiation Preserves Objective

*For any* differentiated content, the learningObjective field SHALL be identical to the original content's learningObjective.

**Validates: Requirements 8.5**

### Property 20: Differentiation Schema Preservation

*For any* differentiated content, the output SHALL pass the same schema validation as the original content type.

**Validates: Requirements 8.6**

### Property 21: Refinement Undo Round-Trip

*For any* content refinement action, applying undo SHALL restore the content to its pre-refinement state.

**Validates: Requirements 10.4**

### Property 22: Standards Filter Accuracy

*For any* standards search with grade level and subject filters, all returned standards SHALL match the specified grade level and subject.

**Validates: Requirements 11.2**

### Property 23: Standards Display Completeness

*For any* selected standard, the display SHALL include the full standard text and code.

**Validates: Requirements 11.3**

### Property 24: Content Persistence Metadata

*For any* saved content (lesson plan, quiz, worksheet, etc.), it SHALL have non-null createdAt timestamp and createdBy user reference.

**Validates: Requirements 13.1**

### Property 25: Lesson Plan Version History

*For any* lesson plan that has been updated, the previous version SHALL be retrievable from version history.

**Validates: Requirements 13.2**

### Property 26: Lesson Plan Retrieval Completeness

*For any* retrieved lesson plan, it SHALL include all associated activities (quizzes, worksheets, readings) that reference its ID.

**Validates: Requirements 13.3**

### Property 27: Search Result Relevance

*For any* lesson plan search by topic, the returned results SHALL contain the search term in their topic field.

**Validates: Requirements 13.4**

### Property 28: Soft Delete Preservation

*For any* deleted lesson plan, it SHALL be retrievable with an 'archived' status rather than permanently removed.

**Validates: Requirements 13.5**

## UI Component Specifications

### Calendar Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header: Educasol | [Week/Month Toggle] | [+ New Unit] | [Profile]     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐                   │
│  │ Monday  │ Tuesday │Wednesday│Thursday │ Friday  │  Quick Actions    │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤  ┌─────────────┐  │
│  │ Period 1│         │         │         │         │  │ + Lesson    │  │
│  │ ┌─────┐ │  [+]    │  [+]    │  [+]    │  [+]    │  │ + Quiz      │  │
│  │ │Cell │ │         │         │         │         │  │ + Worksheet │  │
│  │ │Bio  │ │         │         │         │         │  │ + Reading   │  │
│  │ │✓    │ │         │         │         │         │  └─────────────┘  │
│  │ └─────┘ │         │         │         │         │                   │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┤  Unit: Cell Bio   │
│  │ Period 2│         │         │         │         │  ┌─────────────┐  │
│  │  [+]    │  [+]    │  [+]    │  [+]    │  [+]    │  │ Day 1 of 10 │  │
│  │         │         │         │         │         │  │ Standards:  │  │
│  │         │         │         │         │         │  │ NGSS.LS1.A  │  │
│  │         │         │         │         │         │  └─────────────┘  │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Lesson Card States

| Status | Background | Border | Icon |
|--------|------------|--------|------|
| Planned | `bg-slate-100 dark:bg-slate-800` | `border-slate-300` | 📋 |
| In Progress | `bg-amber-50 dark:bg-amber-900/20` | `border-amber-400` | ⏳ |
| Completed | `bg-emerald-50 dark:bg-emerald-900/20` | `border-emerald-400` | ✓ |

### Activity Generator Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Generate Activity for: "Cell Structure - Day 3"          [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Activity Type:                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  Quiz   │ │Worksheet│ │ Reading │ │ Slides  │              │
│  │   📝    │ │   📄    │ │   📖    │ │   📊    │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  Options (for Quiz):                                           │
│  Questions: [10] ▼                                             │
│  Types: [x] Multiple Choice [x] True/False [ ] Short Answer   │
│  Bloom's Level: [Apply/Analyze] ▼                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    [Generate ✨]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Context: Using lesson objectives and vocabulary from Day 3    │
└─────────────────────────────────────────────────────────────────┘
```

### Differentiation Toolbar

```
┌─────────────────────────────────────────────────────────────────┐
│  Differentiate Content                                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  ELL    │ │Advanced │ │  ADHD   │ │ Visual  │              │
│  │ 🌍      │ │   🚀    │ │   🎯    │ │   👁️    │              │
│  │Simplify │ │ Extend  │ │  Chunk  │ │  Aids   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  Preview changes before applying                               │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema Extensions

### New Tables

```sql
-- Unit Plans
CREATE TABLE unit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  standards TEXT[] NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 30),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sub_skills JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Plans
CREATE TABLE lesson_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES unit_plans(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration INTEGER NOT NULL,
  standards TEXT[] NOT NULL,
  learning_objective TEXT NOT NULL,
  key_vocabulary JSONB NOT NULL DEFAULT '[]',
  materials_needed TEXT[] DEFAULT '{}',
  phases JSONB NOT NULL DEFAULT '[]',
  formative_assessment JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planned', 'in-progress', 'completed')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

-- Lesson Plan Versions (for history)
CREATE TABLE lesson_plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID REFERENCES lesson_plans(id) NOT NULL,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Activities
CREATE TABLE generated_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_plan_id UUID REFERENCES lesson_plans(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'worksheet', 'reading', 'slides')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standards Database
CREATE TABLE standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework TEXT NOT NULL CHECK (framework IN ('bncc', 'common-core', 'teks')),
  code TEXT NOT NULL,
  text TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  parent_code TEXT,
  UNIQUE(framework, code)
);

CREATE INDEX idx_standards_search ON standards USING GIN (to_tsvector('english', code || ' ' || text));
CREATE INDEX idx_standards_filter ON standards (framework, grade_level, subject);
```

## API Endpoints

### Unit Plans

```
POST   /api/units              - Create new unit plan (AI-generated)
GET    /api/units              - List user's unit plans
GET    /api/units/:id          - Get unit plan with lesson outlines
PUT    /api/units/:id          - Update unit plan
DELETE /api/units/:id          - Archive unit plan
```

### Lesson Plans

```
POST   /api/lessons            - Create/generate lesson plan
GET    /api/lessons            - List lessons (with filters)
GET    /api/lessons/:id        - Get lesson with activities
PUT    /api/lessons/:id        - Update lesson plan
DELETE /api/lessons/:id        - Archive lesson plan
GET    /api/lessons/:id/versions - Get version history
POST   /api/lessons/:id/restore  - Restore from version
```

### Activity Generation

```
POST   /api/generate/quiz      - Generate quiz from lesson context
POST   /api/generate/worksheet - Generate worksheet
POST   /api/generate/reading   - Generate leveled reading
POST   /api/generate/slides    - Generate slide outline
POST   /api/generate/differentiate - Differentiate content
POST   /api/generate/refine    - Refine selected content
```

### Standards

```
GET    /api/standards          - Search standards (with filters)
GET    /api/standards/:code    - Get standard with sub-standards
```

### Export

```
POST   /api/export/pdf         - Export content as PDF
POST   /api/export/pptx        - Export slides as PowerPoint
POST   /api/export/csv         - Export quiz as CSV
```
