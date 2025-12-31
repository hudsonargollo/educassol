import { z } from 'zod';

/**
 * Schema for sub-skills within a unit plan
 */
export const SubSkillSchema = z.object({
  skill: z.string().min(1, 'Skill description is required'),
  standard: z.string().min(1, 'Standard reference is required'),
  dayNumber: z.number().int().positive('Day number must be a positive integer'),
});

/**
 * Schema for lesson outlines within a unit plan
 */
export const LessonOutlineSchema = z.object({
  dayNumber: z.number().int().positive('Day number must be a positive integer'),
  date: z.coerce.date(),
  topic: z.string().min(1, 'Topic is required'),
  objective: z.string().min(1, 'Objective is required'),
  lessonPlanId: z.string().uuid().optional(),
});

/**
 * Schema for a complete unit plan
 * Requirements: 2.1, 2.3, 2.4
 */
export const UnitPlanSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  standards: z.array(z.string()).min(1, 'At least one standard is required'),
  
  // Requirement 2.1: Duration in days
  durationDays: z.number().int().positive().max(30, 'Duration cannot exceed 30 days'),
  
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  
  // Requirement 2.3: Sub-skills decomposed from standards
  subSkills: z.array(SubSkillSchema).default([]),
  
  // Requirement 2.4: Lesson outlines array matching duration
  lessonOutlines: z.array(LessonOutlineSchema),
  
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().min(1, 'Creator ID is required'),
}).refine(
  (data) => data.lessonOutlines.length === data.durationDays,
  {
    message: 'Lesson outlines count must match duration days',
    path: ['lessonOutlines'],
  }
).refine(
  (data) => {
    const dayNumbers = data.lessonOutlines.map(l => l.dayNumber);
    const expectedDays = Array.from({ length: data.durationDays }, (_, i) => i + 1);
    return expectedDays.every(day => dayNumbers.includes(day));
  },
  {
    message: 'Lesson outlines must have unique day numbers from 1 to durationDays',
    path: ['lessonOutlines'],
  }
).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  }
);

/**
 * TypeScript types inferred from schemas
 */
export type SubSkill = z.infer<typeof SubSkillSchema>;
export type LessonOutline = z.infer<typeof LessonOutlineSchema>;
export type UnitPlan = z.infer<typeof UnitPlanSchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
}

/**
 * Validates a unit plan object against the schema.
 * Requirements: 2.3, 2.4 - Ensures lesson outlines match duration
 * 
 * @param unitPlan - The unit plan object to validate
 * @returns ValidationResult with success status and either data or errors
 */
export function validateUnitPlan(unitPlan: unknown): ValidationResult<UnitPlan> {
  const result = UnitPlanSchema.safeParse(unitPlan);
  
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
 * Serializes a unit plan to JSON string
 */
export function serializeUnitPlan(unitPlan: UnitPlan): string {
  return JSON.stringify(unitPlan);
}

/**
 * Deserializes a JSON string to a unit plan
 */
export function deserializeUnitPlan(json: string): ValidationResult<UnitPlan> {
  try {
    const parsed = JSON.parse(json);
    return validateUnitPlan(parsed);
  } catch {
    return {
      success: false,
      errors: [{ code: 'custom', message: 'Invalid JSON string', path: [] }],
    };
  }
}
