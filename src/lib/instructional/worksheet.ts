import { z } from 'zod';

/**
 * Schema for vocabulary matching content
 * Requirement 6.2: Vocabulary matching activities with terms and definitions
 */
export const VocabularyMatchingSchema = z.object({
  terms: z.array(z.object({
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
  })).min(1, 'At least one term is required'),
});

/**
 * Schema for cloze (fill-in-the-blank) passage content
 * Requirement 6.3: Cloze passages from lesson summaries
 */
export const ClozePassageSchema = z.object({
  text: z.string().min(1, 'Cloze text is required'),
  answers: z.array(z.string()).min(1, 'At least one answer is required'),
});

/**
 * Schema for diagram labeling content
 */
export const DiagramLabelingSchema = z.object({
  imageDescription: z.string().min(1, 'Image description is required'),
  labels: z.array(z.object({
    position: z.string().min(1, 'Position is required'),
    answer: z.string().min(1, 'Answer is required'),
  })).min(1, 'At least one label is required'),
});

/**
 * Schema for short answer section content
 */
export const ShortAnswerSectionSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    expectedAnswer: z.string().min(1, 'Expected answer is required'),
  })).min(1, 'At least one question is required'),
});

/**
 * Worksheet section types
 * Requirement 6.2, 6.3: Support vocabulary matching and cloze sections
 */
export const WorksheetSectionTypeSchema = z.enum([
  'vocabulary-matching',
  'cloze',
  'diagram-labeling',
  'short-answer',
]);

/**
 * Schema for a worksheet section
 * Requirements: 6.2, 6.3
 */
export const WorksheetSectionSchema = z.object({
  type: WorksheetSectionTypeSchema,
  instructions: z.string().min(1, 'Instructions are required'),
  content: z.union([
    VocabularyMatchingSchema,
    ClozePassageSchema,
    DiagramLabelingSchema,
    ShortAnswerSectionSchema,
  ]),
}).refine(
  (data) => {
    if (data.type === 'vocabulary-matching') {
      return VocabularyMatchingSchema.safeParse(data.content).success;
    }
    if (data.type === 'cloze') {
      return ClozePassageSchema.safeParse(data.content).success;
    }
    if (data.type === 'diagram-labeling') {
      return DiagramLabelingSchema.safeParse(data.content).success;
    }
    if (data.type === 'short-answer') {
      return ShortAnswerSectionSchema.safeParse(data.content).success;
    }
    return false;
  },
  {
    message: 'Section content must match the section type',
    path: ['content'],
  }
);

/**
 * Schema for a complete worksheet
 * Requirement 6.4: Return content in Markdown format suitable for PDF export
 */
export const WorksheetSchema = z.object({
  id: z.string().uuid(),
  lessonPlanId: z.string().uuid(),
  title: z.string().min(1, 'Worksheet title is required'),
  sections: z.array(WorksheetSectionSchema).min(1, 'At least one section is required'),
  
  // Requirement 6.4: Markdown content for PDF export
  markdownContent: z.string().min(1, 'Markdown content is required'),
  
  createdAt: z.coerce.date(),
});

/**
 * TypeScript types inferred from schemas
 */
export type VocabularyMatching = z.infer<typeof VocabularyMatchingSchema>;
export type ClozePassage = z.infer<typeof ClozePassageSchema>;
export type DiagramLabeling = z.infer<typeof DiagramLabelingSchema>;
export type ShortAnswerSection = z.infer<typeof ShortAnswerSectionSchema>;
export type WorksheetSectionType = z.infer<typeof WorksheetSectionTypeSchema>;
export type WorksheetSection = z.infer<typeof WorksheetSectionSchema>;
export type Worksheet = z.infer<typeof WorksheetSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a worksheet object against the schema.
 * 
 * @param worksheet - The worksheet object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateWorksheet(worksheet: unknown): ValidationResult<Worksheet> {
  const result = WorksheetSchema.safeParse(worksheet);
  
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
 * Serializes a worksheet to JSON string
 */
export function serializeWorksheet(worksheet: Worksheet): string {
  return JSON.stringify(worksheet);
}

/**
 * Deserializes a JSON string to a worksheet
 */
export function deserializeWorksheet(json: string): ValidationResult<Worksheet> {
  try {
    const parsed = JSON.parse(json);
    return validateWorksheet(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}
