import { z } from 'zod';

/**
 * Handwriting quality levels
 */
export const HandwritingQuality = z.enum(['excellent', 'good', 'poor', 'illegible']);
export type HandwritingQuality = z.infer<typeof HandwritingQuality>;

/**
 * Schema for a question override (educator's manual adjustment to AI score)
 */
export const QuestionOverrideSchema = z.object({
  questionNumber: z.string().min(1, 'Question number is required'),
  originalScore: z.number().min(0, 'Original score must be non-negative'),
  overrideScore: z.number().min(0, 'Override score must be non-negative'),
  overrideReason: z.string().optional(),
  overriddenAt: z.coerce.date(),
});

export type QuestionOverride = z.infer<typeof QuestionOverrideSchema>;

/**
 * Schema for student metadata extracted from the exam
 */
export const StudentMetadataSchema = z.object({
  name: z.string(),
  student_id: z.string(),
  handwriting_quality: HandwritingQuality,
});

/**
 * Schema for a single question result
 */
export const QuestionResultSchema = z.object({
  number: z.string(),
  topic: z.string(),
  student_response_transcription: z.string(),
  is_correct: z.boolean(),
  points_awarded: z.number(),
  max_points: z.number(),
  reasoning: z.string(),
  feedback_for_student: z.string(),
});

/**
 * Schema for the complete grading result from Gemini
 */
export const GradingResultSchema = z.object({
  student_metadata: StudentMetadataSchema,
  questions: z.array(QuestionResultSchema).min(1),
  summary_comment: z.string(),
  total_score: z.number(),
  confidenceScore: z.number().min(0).max(100).optional(),
  overrides: z.array(QuestionOverrideSchema).optional(),
});

/**
 * TypeScript interface for student metadata
 */
export interface StudentMetadata {
  name: string;
  student_id: string;
  handwriting_quality: HandwritingQuality;
}

/**
 * TypeScript interface for a question result
 */
export interface QuestionResult {
  number: string;
  topic: string;
  student_response_transcription: string;
  is_correct: boolean;
  points_awarded: number;
  max_points: number;
  reasoning: string;
  feedback_for_student: string;
}

/**
 * TypeScript interface for the complete grading result
 */
export interface GradingResult {
  student_metadata: StudentMetadata;
  questions: QuestionResult[];
  summary_comment: string;
  total_score: number;
  confidenceScore?: number;
  overrides?: QuestionOverride[];
}

/**
 * Validation result type
 */
export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Parses and validates a grading result object.
 * Ensures the result contains student_metadata (with name, student_id, handwriting_quality),
 * a questions array (each with required fields), summary_comment, and total_score.
 * 
 * @param input - The grading result object to parse and validate
 * @returns ParseResult with success status and either data or errors
 */
export function parseGradingResult(input: unknown): ParseResult<GradingResult> {
  const result = GradingResultSchema.safeParse(input);
  
  if (result.success) {
    return {
      success: true,
      data: result.data as GradingResult,
    };
  }
  
  return {
    success: false,
    errors: result.error.errors,
  };
}

/**
 * Serializes a GradingResult to JSON string
 * 
 * @param result - The grading result to serialize
 * @returns JSON string representation
 */
export function serializeGradingResult(result: GradingResult): string {
  return JSON.stringify(result);
}

/**
 * Deserializes a JSON string to GradingResult with validation
 * 
 * @param json - The JSON string to deserialize
 * @returns ParseResult with success status and either data or errors
 */
export function deserializeGradingResult(json: string): ParseResult<GradingResult> {
  try {
    const parsed = JSON.parse(json);
    return parseGradingResult(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}
