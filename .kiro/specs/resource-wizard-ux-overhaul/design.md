# Design Document: Resource Creation Wizard UX Overhaul

## Overview

This design document describes the architectural and implementation approach for restructuring the Content Wizard from its current 5-step flow with uneven complexity distribution into a balanced 5-step flow with clear logical groupings. The redesign introduces centralized state management, smart defaults based on class context, and improved visual hierarchy for methodology and template selection.

The key transformation moves from:
- **Current**: Class → Subject → (Overloaded: Topic, BNCC, Sliders, Methods, Accessibility) → Suggestions → Result
- **Proposed**: Context → Objectives → Strategy → Configuration → Review

## Architecture

### Component Architecture

```
src/components/dashboard/wizard/
├── WizardContext.tsx          # Central state management via React Context
├── WizardProvider.tsx         # Context provider with localStorage persistence
├── StepContext.tsx            # Step 1: Class/Grade/Subject selection
├── StepObjectives.tsx         # Step 2: Topic + BNCC standards
├── StepStrategy.tsx           # Step 3: Methodologies + Templates + Ideas
├── StepConfiguration.tsx      # Step 4: Logistics + Accessibility
├── StepReview.tsx             # Step 5: Summary + Generate
├── components/
│   ├── MethodologyCard.tsx    # Visual card for methodology selection
│   ├── TemplateCarousel.tsx   # Carousel/grid for template selection
│   ├── BnccChips.tsx          # Chip display for selected standards
│   ├── SummaryCard.tsx        # Clickable summary item for review
│   └── ProgressHeader.tsx     # Progress bar with phase labels
└── hooks/
    └── useWizardNavigation.ts # Navigation and validation logic
```

### State Management

The wizard will use React Context to centralize state management, replacing the current prop drilling pattern:

```typescript
interface WizardState {
  // Step 1: Context
  classId?: string;
  classContext?: ClassContext;
  grade: string;
  subject: string;
  
  // Step 2: Objectives
  topic: string;
  selectedBnccCodes: string[];
  
  // Step 3: Strategy
  methodologies: string[];
  templateId?: string;
  specificIdea: string;
  
  // Step 4: Configuration
  studentsPerClass: number;
  numberOfLessons: number;
  durationPerLesson: number;
  noDigitalResources: boolean;
  accessibilityOptions: string[];
  
  // Navigation
  currentStep: number;
}

interface ClassContext {
  total_alunos: number | null;
  possui_ane: boolean;
  detalhes_ane: string | null;
}
```

## Components and Interfaces

### WizardContext

Provides centralized state management for all wizard steps:

```typescript
interface WizardContextValue {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: () => boolean;
  resetWizard: () => void;
}
```

### StepContext (Step 1)

Combines class selection with grade/subject into a single cohesive step:

```typescript
interface StepContextProps {
  // No props needed - uses WizardContext
}

// Behavior:
// - When class selected: auto-populate grade, subject, classContext
// - When no class: enable manual grade/subject selection
// - Validation: requires either classId OR (grade AND subject)
```

### StepObjectives (Step 2)

Topic input with integrated BNCC suggestions:

```typescript
interface StepObjectivesProps {
  // No props needed - uses WizardContext
}

// Behavior:
// - Topic input with debounced BNCC suggestion trigger (500ms)
// - "Find Standards" button as alternative to auto-trigger
// - Selected standards displayed as removable chips
// - Validation: requires topic to be non-empty
```

### StepStrategy (Step 3)

Visual methodology and template selection:

```typescript
interface MethodologyOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface StepStrategyProps {
  // No props needed - uses WizardContext
}

// Methodologies displayed as cards with:
// - Icon (Lucide icon name)
// - Title
// - Brief description
// - Selected state with border-primary styling
```

### StepConfiguration (Step 4)

Logistics and accessibility grouped into sections:

```typescript
interface StepConfigurationProps {
  // No props needed - uses WizardContext
}

// Behavior:
// - Auto-expand accessibility section if classContext.possui_ane is true
// - Pre-select relevant accessibility options based on detalhes_ane
// - "Low Tech Mode" switch for noDigitalResources
```

### StepReview (Step 5)

Summary with navigation and generation:

```typescript
interface SummarySection {
  title: string;
  content: string | string[];
  editStep: number;
}

interface StepReviewProps {
  onGenerate: () => void;
  // No other props needed - uses WizardContext
}

// Each summary section is clickable to navigate back to edit
```

## Data Models

### WizardState Persistence

```typescript
interface PersistedWizardState {
  state: WizardState;
  timestamp: number;
  contentType: string;
}

// localStorage key: 'wizard_draft_{contentType}'
// Auto-expire after 24 hours
```

### Methodology Options

```typescript
const METHODOLOGY_OPTIONS: MethodologyOption[] = [
  {
    id: 'pbl',
    name: 'Aprendizagem Baseada em Problemas',
    icon: 'Lightbulb',
    description: 'Alunos resolvem problemas reais aplicando conhecimentos'
  },
  {
    id: 'project',
    name: 'Aprendizagem Baseada em Projetos',
    icon: 'FolderKanban',
    description: 'Desenvolvimento de projetos práticos e colaborativos'
  },
  {
    id: 'flipped',
    name: 'Sala de Aula Invertida',
    icon: 'RefreshCw',
    description: 'Conteúdo estudado em casa, prática em sala'
  },
  {
    id: 'gamification',
    name: 'Gamificação',
    icon: 'Gamepad2',
    description: 'Elementos de jogos para engajar os alunos'
  },
  {
    id: 'peer',
    name: 'Aprendizagem por Pares',
    icon: 'Users',
    description: 'Alunos ensinam e aprendem uns com os outros'
  },
  {
    id: 'stations',
    name: 'Rotação por Estações',
    icon: 'LayoutGrid',
    description: 'Grupos rotacionam entre atividades diferentes'
  }
];
```

### Step Configuration

```typescript
const WIZARD_STEPS = [
  { number: 1, key: 'context', label: 'Contexto', phase: 'Definindo o Contexto' },
  { number: 2, key: 'objectives', label: 'Objetivos', phase: 'Definindo Objetivos' },
  { number: 3, key: 'strategy', label: 'Estratégia', phase: 'Escolhendo Estratégia' },
  { number: 4, key: 'configuration', label: 'Configuração', phase: 'Configurando Detalhes' },
  { number: 5, key: 'review', label: 'Revisão', phase: 'Revisão Final' }
];
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Class Selection Auto-Population

*For any* class object with grade and subject metadata, when selected in the Context step, the wizard state SHALL contain the class's grade, subject, and classContext values.

**Validates: Requirements 2.1, 2.2**

### Property 2: Manual Mode Exclusivity

*For any* wizard state, manual grade/subject selection SHALL be enabled if and only if no classId is set.

**Validates: Requirements 2.3**

### Property 3: Topic Validation Gate

*For any* wizard state where the topic field is empty or whitespace-only, the canProceed function for Step 2 SHALL return false.

**Validates: Requirements 3.4**

### Property 4: BNCC Chips Rendering

*For any* non-empty array of selectedBnccCodes, the StepObjectives component SHALL render exactly that many removable chip elements.

**Validates: Requirements 3.3**

### Property 5: Accessibility Auto-Expansion

*For any* wizard state where classContext.possui_ane is true, the Configuration step SHALL render the accessibility section in expanded state.

**Validates: Requirements 5.1**

### Property 6: Review Summary Completeness

*For any* wizard state with all required fields populated, the Review step SHALL render summary sections for: Target Audience (grade/subject), Topic/Standards, Methodology, and Logistics.

**Validates: Requirements 6.1**

### Property 7: Summary Navigation

*For any* summary section in the Review step, clicking it SHALL update currentStep to the corresponding edit step number.

**Validates: Requirements 6.3**

### Property 8: State Persistence Round-Trip

*For any* valid wizard state, saving to localStorage and then restoring SHALL produce an equivalent state object.

**Validates: Requirements 7.2, 7.3**

### Property 9: Navigation State Preservation

*For any* wizard state, navigating from step N to step N-1 and back to step N SHALL preserve all field values.

**Validates: Requirements 8.4**

### Property 10: Step Validation

*For any* step with required fields, the Next button SHALL be disabled when required fields are incomplete and enabled when they are complete.

**Validates: Requirements 8.3**

## Error Handling

### Validation Errors

- **Empty Topic**: Display inline error message below topic input, disable Next button
- **No Grade/Subject**: Display alert prompting class selection or manual entry
- **BNCC API Failure**: Show toast notification, allow proceeding without standards
- **Template Load Failure**: Show toast, hide template section gracefully

### State Recovery

- **Corrupted localStorage**: Clear stored state, start fresh wizard
- **Expired Draft**: Show toast offering to restore or start fresh
- **Missing Class Data**: If selected classId no longer exists, clear selection and prompt re-selection

### Network Errors

- **BNCC Suggestion Failure**: Retry with exponential backoff (max 3 attempts), then show manual entry option
- **Generation Failure**: Show error with retry button, preserve all wizard state

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

- Component rendering with various prop combinations
- Event handler behavior (click, input, blur)
- Conditional rendering logic (manual mode, accessibility expansion)
- Validation function edge cases (empty strings, whitespace, null values)

### Property-Based Tests

Property-based tests will use fast-check to verify universal properties across generated inputs:

**Testing Framework**: Vitest with fast-check
**Minimum Iterations**: 100 per property test

Each property test must be tagged with:
```typescript
// Feature: resource-wizard-ux-overhaul, Property N: [property description]
```

**Property Test Coverage**:

1. **State Management Properties**
   - Class selection auto-population (Property 1)
   - Manual mode exclusivity (Property 2)
   - State persistence round-trip (Property 8)
   - Navigation state preservation (Property 9)

2. **Validation Properties**
   - Topic validation gate (Property 3)
   - Step validation (Property 10)

3. **Rendering Properties**
   - BNCC chips rendering (Property 4)
   - Accessibility auto-expansion (Property 5)
   - Review summary completeness (Property 6)

4. **Navigation Properties**
   - Summary navigation (Property 7)

### Integration Tests

- Full wizard flow from Context to Generation
- Class selection → auto-population → generation flow
- Manual entry → BNCC suggestion → generation flow
- Draft persistence across dialog close/reopen

### Generators for Property Tests

```typescript
// Class generator
const classArbitrary = fc.record({
  id: fc.uuid(),
  grade: fc.constantFrom(...GRADE_OPTIONS),
  subject: fc.constantFrom(...SUBJECT_OPTIONS),
  total_alunos: fc.option(fc.integer({ min: 10, max: 50 })),
  possui_ane: fc.boolean(),
  detalhes_ane: fc.option(fc.string({ minLength: 0, maxLength: 200 }))
});

// Wizard state generator
const wizardStateArbitrary = fc.record({
  classId: fc.option(fc.uuid()),
  grade: fc.constantFrom('', ...GRADE_OPTIONS),
  subject: fc.constantFrom('', ...SUBJECT_OPTIONS),
  topic: fc.string({ minLength: 0, maxLength: 500 }),
  selectedBnccCodes: fc.array(fc.stringMatching(/^EF\d{2}[A-Z]{2}\d{2}$/), { maxLength: 10 }),
  methodologies: fc.array(fc.constantFrom(...METHODOLOGY_IDS), { maxLength: 6 }),
  templateId: fc.option(fc.uuid()),
  specificIdea: fc.string({ minLength: 0, maxLength: 200 }),
  studentsPerClass: fc.integer({ min: 10, max: 50 }),
  numberOfLessons: fc.integer({ min: 1, max: 10 }),
  durationPerLesson: fc.constantFrom(30, 45, 60, 90, 120),
  noDigitalResources: fc.boolean(),
  accessibilityOptions: fc.array(fc.constantFrom(...ACCESSIBILITY_IDS), { maxLength: 13 }),
  currentStep: fc.integer({ min: 1, max: 5 })
});
```
