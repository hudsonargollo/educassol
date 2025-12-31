import { z } from 'zod';

/**
 * Slide types for presentation outlines
 * Requirement 7.2: Include Title, Agenda, Concept Definition, Examples, and Summary slides
 */
export const SlideTypeSchema = z.enum([
  'title',
  'agenda',
  'concept',
  'example',
  'activity',
  'summary',
]);

/**
 * Schema for a single slide
 * Requirement 7.4: Include speaker notes for each slide
 */
export const SlideSchema = z.object({
  slideNumber: z.number().int().positive('Slide number must be positive'),
  type: SlideTypeSchema,
  title: z.string().min(1, 'Slide title is required'),
  bulletPoints: z.array(z.string()).default([]),
  
  // Requirement 7.4: Speaker notes for each slide
  speakerNotes: z.string().min(1, 'Speaker notes are required'),
  
  visualSuggestion: z.string().optional(),
});

/**
 * Schema for a complete slide outline
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export const SlideOutlineSchema = z.object({
  id: z.string().uuid(),
  lessonPlanId: z.string().uuid(),
  title: z.string().min(1, 'Slide outline title is required'),
  
  // Requirement 7.1: Slide-by-slide structure for Direct Instruction phase
  slides: z.array(SlideSchema).min(1, 'At least one slide is required'),
  
  createdAt: z.coerce.date(),
}).refine(
  // Requirement 7.2: Must include title, concept, and summary slides
  (data) => {
    const types = data.slides.map(s => s.type);
    return types.includes('title') && types.includes('concept') && types.includes('summary');
  },
  {
    message: 'Slide outline must include at least one title, concept, and summary slide',
    path: ['slides'],
  }
);

/**
 * TypeScript types inferred from schemas
 */
export type SlideType = z.infer<typeof SlideTypeSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideOutline = z.infer<typeof SlideOutlineSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a slide outline object against the schema.
 * Requirement 7.3: Return structured JSON compatible with presentation generation
 * 
 * @param slideOutline - The slide outline object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateSlideOutline(slideOutline: unknown): ValidationResult<SlideOutline> {
  const result = SlideOutlineSchema.safeParse(slideOutline);
  
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
 * Serializes a slide outline to JSON string
 */
export function serializeSlideOutline(slideOutline: SlideOutline): string {
  return JSON.stringify(slideOutline);
}

/**
 * Deserializes a JSON string to a slide outline
 */
export function deserializeSlideOutline(json: string): ValidationResult<SlideOutline> {
  try {
    const parsed = JSON.parse(json);
    return validateSlideOutline(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}

/**
 * Required slide types for a complete presentation
 */
export const REQUIRED_SLIDE_TYPES: SlideType[] = ['title', 'concept', 'summary'];

/**
 * Checks if a slide outline has all required slide types
 */
export function hasRequiredSlideTypes(slides: Slide[]): boolean {
  const types = slides.map(s => s.type);
  return REQUIRED_SLIDE_TYPES.every(type => types.includes(type));
}
