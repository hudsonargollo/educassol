import { z } from 'zod';

/**
 * Schema for a single rubric question
 */
export const RubricQuestionSchema = z.object({
  number: z.string().min(1, 'Question number is required'),
  topic: z.string().min(1, 'Topic is required'),
  max_points: z.number().int().positive('Max points must be a positive integer'),
  expected_answer: z.string().optional(),
  partial_credit_criteria: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Schema for a complete rubric
 */
export const RubricSchema = z.object({
  title: z.string().min(1, 'Rubric title is required'),
  total_points: z.number().int().positive('Total points must be a positive integer'),
  questions: z.array(RubricQuestionSchema).min(1, 'At least one question is required'),
  grading_instructions: z.string().optional(),
});

/**
 * TypeScript interface for a rubric question
 */
export interface RubricQuestion {
  number: string;
  topic: string;
  max_points: number;
  expected_answer?: string;
  partial_credit_criteria?: string[];
  keywords?: string[];
}

/**
 * TypeScript interface for a complete rubric
 */
export interface Rubric {
  title: string;
  total_points: number;
  questions: RubricQuestion[];
  grading_instructions?: string;
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a rubric object against the schema.
 * Accepts rubrics containing question definitions with point allocations,
 * and rejects rubrics missing these required elements.
 * 
 * @param rubric - The rubric object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateRubric(rubric: unknown): ValidationResult<Rubric> {
  const result = RubricSchema.safeParse(rubric);
  
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
