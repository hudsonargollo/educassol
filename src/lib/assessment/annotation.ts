import { z } from 'zod';

/**
 * Annotation types for feedback on submissions
 */
export const AnnotationType = z.enum(['highlight', 'comment', 'correction']);
export type AnnotationType = z.infer<typeof AnnotationType>;

/**
 * Schema for text-based annotation location (for PDF/text submissions)
 */
export const TextLocationSchema = z.object({
  startOffset: z.number().int().min(0, 'Start offset must be non-negative'),
  endOffset: z.number().int().min(0, 'End offset must be non-negative'),
  pageNumber: z.number().int().min(1, 'Page number must be at least 1'),
});

/**
 * Schema for image-based annotation location (for image submissions)
 */
export const ImageLocationSchema = z.object({
  x: z.number().min(0, 'X coordinate must be non-negative'),
  y: z.number().min(0, 'Y coordinate must be non-negative'),
  width: z.number().min(0, 'Width must be non-negative'),
  height: z.number().min(0, 'Height must be non-negative'),
  pageNumber: z.number().int().min(1, 'Page number must be at least 1'),
});

/**
 * Schema for annotation location - supports both text and image locations
 * Text locations use startOffset/endOffset, image locations use x/y/width/height
 */
export const AnnotationLocationSchema = z.union([
  TextLocationSchema,
  ImageLocationSchema,
]).refine(
  (location) => {
    // Check if it's a text location (has startOffset and endOffset)
    if ('startOffset' in location && 'endOffset' in location) {
      return location.endOffset >= location.startOffset;
    }
    return true;
  },
  { message: 'End offset must be greater than or equal to start offset' }
);

export type TextLocation = z.infer<typeof TextLocationSchema>;
export type ImageLocation = z.infer<typeof ImageLocationSchema>;
export type AnnotationLocation = z.infer<typeof AnnotationLocationSchema>;


/**
 * Schema for a complete annotation
 */
export const AnnotationSchema = z.object({
  id: z.string().min(1, 'Annotation ID is required'),
  submissionId: z.string().min(1, 'Submission ID is required'),
  questionNumber: z.string().min(1, 'Question number is required'),
  type: AnnotationType,
  content: z.string().min(1, 'Annotation content is required'),
  location: AnnotationLocationSchema,
  createdAt: z.coerce.date(),
});

export type Annotation = z.infer<typeof AnnotationSchema>;

/**
 * Validation result type
 */
export interface AnnotationValidationResult {
  success: boolean;
  data?: Annotation;
  errors?: z.ZodError['errors'];
}

/**
 * Validates an annotation object against the schema.
 * Ensures the annotation has a valid location (either text offsets or image coordinates),
 * a non-empty questionNumber, and non-empty content.
 * 
 * @param annotation - The annotation object to validate
 * @returns AnnotationValidationResult with success status and either data or errors
 */
export function validateAnnotation(annotation: unknown): AnnotationValidationResult {
  const result = AnnotationSchema.safeParse(annotation);
  
  if (result.success) {
    return {
      success: true,
      data: result.data as Annotation,
    };
  }
  
  return {
    success: false,
    errors: result.error.errors,
  };
}

/**
 * Type guard to check if a location is a text location
 */
export function isTextLocation(location: AnnotationLocation): location is TextLocation {
  return 'startOffset' in location && 'endOffset' in location;
}

/**
 * Type guard to check if a location is an image location
 */
export function isImageLocation(location: AnnotationLocation): location is ImageLocation {
  return 'x' in location && 'y' in location && 'width' in location && 'height' in location;
}
