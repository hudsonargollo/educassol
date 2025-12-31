import { z } from 'zod';

/**
 * Schema for key vocabulary items
 */
export const KeyVocabularySchema = z.object({
  term: z.string().min(1, 'Term is required'),
  definition: z.string().min(1, 'Definition is required'),
});

/**
 * Schema for differentiation notes within a phase
 */
export const DifferentiationNotesSchema = z.object({
  support: z.string(),
  extension: z.string(),
});

/**
 * Phase types following the 5E Instructional Model
 */
export const PhaseTypeSchema = z.enum([
  'hook',
  'direct-instruction',
  'guided-practice',
  'independent-practice',
  'closure',
]);

/**
 * Schema for a lesson phase
 */
export const LessonPhaseSchema = z.object({
  type: PhaseTypeSchema,
  name: z.string().min(1, 'Phase name is required'),
  duration: z.number().int().positive('Duration must be a positive integer'),
  teacherScript: z.string().min(1, 'Teacher script is required'),
  studentAction: z.string().min(1, 'Student action is required'),
  differentiationNotes: DifferentiationNotesSchema.optional(),
});

/**
 * Formative assessment types
 */
export const FormativeAssessmentTypeSchema = z.enum([
  'exit-ticket',
  'quick-check',
  'observation',
]);

/**
 * Schema for formative assessment
 */
export const FormativeAssessmentSchema = z.object({
  type: FormativeAssessmentTypeSchema,
  question: z.string().min(1, 'Assessment question is required'),
});

/**
 * Lesson status types
 */
export const LessonStatusSchema = z.enum([
  'draft',
  'planned',
  'in-progress',
  'completed',
]);

/**
 * Schema for a complete lesson plan
 * Requirements: 3.3, 3.4, 3.5, 3.6, 3.7
 */
export const LessonPlanSchema = z.object({
  id: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  date: z.coerce.date(),
  topic: z.string().min(1, 'Topic is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  subject: z.string().min(1, 'Subject is required'),
  duration: z.number().int().positive('Duration must be a positive integer'),
  standards: z.array(z.string()).min(1, 'At least one standard is required'),
  
  // Requirement 3.3: Learning objective aligned to Bloom's Taxonomy
  learningObjective: z.string().min(1, 'Learning objective is required'),
  
  // Requirement 3.5: Key vocabulary with definitions
  keyVocabulary: z.array(KeyVocabularySchema).min(1, 'At least one vocabulary item is required'),
  
  materialsNeeded: z.array(z.string()).default([]),
  
  // Requirement 3.4: Timed phases with teacher scripts and student actions
  phases: z.array(LessonPhaseSchema).min(1, 'At least one phase is required'),
  
  // Requirement 3.6: Formative assessment (exit ticket)
  formativeAssessment: FormativeAssessmentSchema,
  
  status: LessonStatusSchema.default('draft'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().min(1, 'Creator ID is required'),
});

/**
 * TypeScript types inferred from schemas
 */
export type KeyVocabulary = z.infer<typeof KeyVocabularySchema>;
export type DifferentiationNotes = z.infer<typeof DifferentiationNotesSchema>;
export type PhaseType = z.infer<typeof PhaseTypeSchema>;
export type LessonPhase = z.infer<typeof LessonPhaseSchema>;
export type FormativeAssessmentType = z.infer<typeof FormativeAssessmentTypeSchema>;
export type FormativeAssessment = z.infer<typeof FormativeAssessmentSchema>;
export type LessonStatus = z.infer<typeof LessonStatusSchema>;
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a lesson plan object against the schema.
 * Requirement 3.7: Returns valid JSON matching the LessonPlan schema
 * 
 * @param lessonPlan - The lesson plan object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateLessonPlan(lessonPlan: unknown): ValidationResult<LessonPlan> {
  const result = LessonPlanSchema.safeParse(lessonPlan);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  return {
    success: false,
    errors: result.error.errors,
  };
}

/**
 * Serializes a lesson plan to JSON string
 */
export function serializeLessonPlan(lessonPlan: LessonPlan): string {
  return JSON.stringify(lessonPlan);
}

/**
 * Deserializes a JSON string to a lesson plan
 */
export function deserializeLessonPlan(json: string): ValidationResult<LessonPlan> {
  try {
    const parsed = JSON.parse(json);
    return validateLessonPlan(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}
