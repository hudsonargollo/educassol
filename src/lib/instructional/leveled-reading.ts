import { z } from 'zod';

/**
 * Schema for a single reading passage with Lexile level
 */
export const ReadingPassageSchema = z.object({
  text: z.string().min(1, 'Passage text is required'),
  lexileLevel: z.number().int().min(0, 'Lexile level must be non-negative'),
});

/**
 * Schema for the three-level passages structure
 * Requirement 4.2: Generate same content at three distinct Lexile levels
 * Requirement 4.4: Return passages as structured JSON with text_easy, text_medium, text_hard
 */
export const LeveledPassagesSchema = z.object({
  easy: ReadingPassageSchema,
  medium: ReadingPassageSchema,
  hard: ReadingPassageSchema,
}).refine(
  (data) => data.easy.lexileLevel < data.medium.lexileLevel,
  {
    message: 'Easy passage Lexile level must be less than medium',
    path: ['easy', 'lexileLevel'],
  }
).refine(
  (data) => data.medium.lexileLevel < data.hard.lexileLevel,
  {
    message: 'Medium passage Lexile level must be less than hard',
    path: ['medium', 'lexileLevel'],
  }
);

/**
 * Schema for a complete leveled reading resource
 * Requirements: 4.2, 4.4
 */
export const LeveledReadingSchema = z.object({
  id: z.string().uuid(),
  lessonPlanId: z.string().uuid(),
  topic: z.string().min(1, 'Topic is required'),
  
  // Requirement 4.2, 4.4: Three Lexile levels
  passages: LeveledPassagesSchema,
  
  // Core concepts that are preserved across all levels
  coreConceptsPreserved: z.array(z.string()).min(1, 'At least one core concept is required'),
  
  createdAt: z.coerce.date(),
});

/**
 * TypeScript types inferred from schemas
 */
export type ReadingPassage = z.infer<typeof ReadingPassageSchema>;
export type LeveledPassages = z.infer<typeof LeveledPassagesSchema>;
export type LeveledReading = z.infer<typeof LeveledReadingSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a leveled reading object against the schema.
 * 
 * @param leveledReading - The leveled reading object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateLeveledReading(leveledReading: unknown): ValidationResult<LeveledReading> {
  const result = LeveledReadingSchema.safeParse(leveledReading);
  
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
 * Serializes a leveled reading to JSON string
 */
export function serializeLeveledReading(leveledReading: LeveledReading): string {
  return JSON.stringify(leveledReading);
}

/**
 * Deserializes a JSON string to a leveled reading
 */
export function deserializeLeveledReading(json: string): ValidationResult<LeveledReading> {
  try {
    const parsed = JSON.parse(json);
    return validateLeveledReading(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}

/**
 * Standard Lexile level ranges for reference
 */
export const LEXILE_LEVEL_RANGES = {
  easy: { min: 400, max: 600 },
  medium: { min: 700, max: 900 },
  hard: { min: 1000, max: 1200 },
} as const;
