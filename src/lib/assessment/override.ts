import { z } from 'zod';
import type { GradingResult, QuestionOverride } from './grading-result';

/**
 * Schema for creating a new question override with bounds validation.
 * The override score must be between 0 and maxPoints (inclusive).
 */
export const CreateOverrideSchema = z.object({
  questionNumber: z.string().min(1, 'Question number is required'),
  originalScore: z.number().min(0, 'Original score must be non-negative'),
  overrideScore: z.number().min(0, 'Override score must be non-negative'),
  maxPoints: z.number().positive('Max points must be positive'),
  overrideReason: z.string().optional(),
}).refine(
  (data) => data.overrideScore <= data.maxPoints,
  { 
    message: 'Override score cannot exceed max points',
    path: ['overrideScore'],
  }
).refine(
  (data) => data.originalScore <= data.maxPoints,
  {
    message: 'Original score cannot exceed max points',
    path: ['originalScore'],
  }
);

export type CreateOverrideInput = z.infer<typeof CreateOverrideSchema>;

/**
 * Validation result type for override creation
 */
export interface OverrideValidationResult {
  success: boolean;
  data?: QuestionOverride;
  errors?: z.ZodError['errors'];
}

/**
 * Validates and creates a question override.
 * Ensures the override score is within bounds (0 to maxPoints).
 * 
 * @param input - The override input to validate
 * @returns OverrideValidationResult with success status and either data or errors
 */
export function createOverride(input: unknown): OverrideValidationResult {
  const result = CreateOverrideSchema.safeParse(input);
  
  if (result.success) {
    const { questionNumber, originalScore, overrideScore, overrideReason } = result.data;
    const override: QuestionOverride = {
      questionNumber,
      originalScore,
      overrideScore,
      overrideReason,
      overriddenAt: new Date(),
    };
    return {
      success: true,
      data: override,
    };
  }
  
  return {
    success: false,
    errors: result.error.errors,
  };
}


/**
 * Calculates the final score for a grading result, applying overrides where present.
 * For each question:
 * - If an override exists for that question, use the override score
 * - Otherwise, use the AI-generated score (points_awarded)
 * 
 * @param gradingResult - The grading result with questions and optional overrides
 * @returns The final total score
 */
export function calculateFinalScore(gradingResult: GradingResult): number {
  const overrideMap = new Map<string, number>();
  
  // Build a map of question number to override score
  if (gradingResult.overrides) {
    for (const override of gradingResult.overrides) {
      overrideMap.set(override.questionNumber, override.overrideScore);
    }
  }
  
  // Calculate total score using overrides where present
  let totalScore = 0;
  for (const question of gradingResult.questions) {
    const overrideScore = overrideMap.get(question.number);
    if (overrideScore !== undefined) {
      totalScore += overrideScore;
    } else {
      totalScore += question.points_awarded;
    }
  }
  
  return totalScore;
}

/**
 * Checks if a question has been overridden
 * 
 * @param gradingResult - The grading result to check
 * @param questionNumber - The question number to check
 * @returns True if the question has an override, false otherwise
 */
export function hasOverride(gradingResult: GradingResult, questionNumber: string): boolean {
  if (!gradingResult.overrides) {
    return false;
  }
  return gradingResult.overrides.some(o => o.questionNumber === questionNumber);
}

/**
 * Gets the override for a specific question, if it exists
 * 
 * @param gradingResult - The grading result to check
 * @param questionNumber - The question number to get the override for
 * @returns The override if found, undefined otherwise
 */
export function getOverride(
  gradingResult: GradingResult, 
  questionNumber: string
): QuestionOverride | undefined {
  if (!gradingResult.overrides) {
    return undefined;
  }
  return gradingResult.overrides.find(o => o.questionNumber === questionNumber);
}

/**
 * Gets the effective score for a question (override if present, otherwise AI score)
 * 
 * @param gradingResult - The grading result
 * @param questionNumber - The question number
 * @returns The effective score for the question, or undefined if question not found
 */
export function getEffectiveScore(
  gradingResult: GradingResult,
  questionNumber: string
): number | undefined {
  const question = gradingResult.questions.find(q => q.number === questionNumber);
  if (!question) {
    return undefined;
  }
  
  const override = getOverride(gradingResult, questionNumber);
  return override ? override.overrideScore : question.points_awarded;
}
