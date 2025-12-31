import { z } from 'zod';

/**
 * Bloom's Taxonomy levels for quiz questions
 * Requirements: 5.2 - Target Apply and Analyze levels by default
 */
export const BloomLevelSchema = z.enum([
  'remember',
  'understand',
  'apply',
  'analyze',
  'evaluate',
  'create',
]);

/**
 * Question types supported by the quiz
 * Requirement 5.4: Multiple choice, true/false, and short answer
 */
export const QuestionTypeSchema = z.enum([
  'multiple-choice',
  'true-false',
  'short-answer',
]);

/**
 * Schema for a quiz question
 * Requirements: 5.2, 5.3, 5.4
 */
export const QuizQuestionSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1, 'Question text is required'),
  type: QuestionTypeSchema,
  
  // For multiple-choice questions
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().int().min(0).optional(),
  
  // For short-answer questions
  correctAnswer: z.string().optional(),
  
  // Requirement 5.3: Explanation for each correct answer
  explanation: z.string().min(1, 'Explanation is required'),
  
  // Requirement 5.2: Bloom's Taxonomy level
  bloomLevel: BloomLevelSchema,
}).refine(
  (data) => {
    if (data.type === 'multiple-choice') {
      return data.options && data.options.length >= 2 && data.correctOptionIndex !== undefined;
    }
    return true;
  },
  {
    message: 'Multiple choice questions require at least 2 options and a correct option index',
    path: ['options'],
  }
).refine(
  (data) => {
    if (data.type === 'multiple-choice' && data.options && data.correctOptionIndex !== undefined) {
      return data.correctOptionIndex < data.options.length;
    }
    return true;
  },
  {
    message: 'Correct option index must be within options array bounds',
    path: ['correctOptionIndex'],
  }
).refine(
  (data) => {
    if (data.type === 'true-false') {
      return data.options && data.options.length === 2 && 
             data.options.includes('True') && data.options.includes('False');
    }
    return true;
  },
  {
    message: 'True/false questions must have exactly "True" and "False" options',
    path: ['options'],
  }
);

/**
 * Schema for a complete quiz
 * Requirement 5.5: Valid JSON matching the Quiz schema
 */
export const QuizSchema = z.object({
  id: z.string().uuid(),
  lessonPlanId: z.string().uuid(),
  title: z.string().min(1, 'Quiz title is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  questions: z.array(QuizQuestionSchema).min(1, 'At least one question is required'),
  createdAt: z.coerce.date(),
});

/**
 * TypeScript types inferred from schemas
 */
export type BloomLevel = z.infer<typeof BloomLevelSchema>;
export type QuestionType = z.infer<typeof QuestionTypeSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a quiz object against the schema.
 * Requirement 5.5: Returns valid JSON matching the Quiz schema
 * 
 * @param quiz - The quiz object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateQuiz(quiz: unknown): ValidationResult<Quiz> {
  const result = QuizSchema.safeParse(quiz);
  
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
 * Serializes a quiz to JSON string
 */
export function serializeQuiz(quiz: Quiz): string {
  return JSON.stringify(quiz);
}

/**
 * Deserializes a JSON string to a quiz
 */
export function deserializeQuiz(json: string): ValidationResult<Quiz> {
  try {
    const parsed = JSON.parse(json);
    return validateQuiz(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}

/**
 * Higher-order Bloom's levels (Apply and above)
 * Used for filtering questions that meet pedagogical requirements
 */
export const HIGHER_ORDER_BLOOM_LEVELS: BloomLevel[] = ['apply', 'analyze', 'evaluate', 'create'];

/**
 * Checks if a Bloom's level is higher-order (Apply or above)
 */
export function isHigherOrderBloomLevel(level: BloomLevel): boolean {
  return HIGHER_ORDER_BLOOM_LEVELS.includes(level);
}
