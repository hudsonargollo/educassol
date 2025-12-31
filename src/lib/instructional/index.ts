/**
 * Instructional Design Platform - Core Data Models
 * 
 * This module exports all schemas, types, and validation functions
 * for the instructional design platform.
 */

// Lesson Plan exports
export {
  KeyVocabularySchema,
  DifferentiationNotesSchema,
  PhaseTypeSchema,
  LessonPhaseSchema,
  FormativeAssessmentTypeSchema,
  FormativeAssessmentSchema,
  LessonStatusSchema,
  LessonPlanSchema,
  validateLessonPlan,
  serializeLessonPlan,
  deserializeLessonPlan,
} from './lesson-plan';

export type {
  KeyVocabulary,
  DifferentiationNotes,
  PhaseType,
  LessonPhase,
  FormativeAssessmentType,
  FormativeAssessment,
  LessonStatus,
  LessonPlan,
} from './lesson-plan';

// Unit Plan exports
export {
  SubSkillSchema,
  LessonOutlineSchema,
  UnitPlanSchema,
  validateUnitPlan,
  serializeUnitPlan,
  deserializeUnitPlan,
} from './unit-plan';

export type {
  SubSkill,
  LessonOutline,
  UnitPlan,
} from './unit-plan';

// Quiz exports
export {
  BloomLevelSchema,
  QuestionTypeSchema,
  QuizQuestionSchema,
  QuizSchema,
  validateQuiz,
  serializeQuiz,
  deserializeQuiz,
  HIGHER_ORDER_BLOOM_LEVELS,
  isHigherOrderBloomLevel,
} from './quiz';

export type {
  BloomLevel,
  QuestionType,
  QuizQuestion,
  Quiz,
} from './quiz';

// Worksheet exports
export {
  VocabularyMatchingSchema,
  ClozePassageSchema,
  DiagramLabelingSchema,
  ShortAnswerSectionSchema,
  WorksheetSectionTypeSchema,
  WorksheetSectionSchema,
  WorksheetSchema,
  validateWorksheet,
  serializeWorksheet,
  deserializeWorksheet,
} from './worksheet';

export type {
  VocabularyMatching,
  ClozePassage,
  DiagramLabeling,
  ShortAnswerSection,
  WorksheetSectionType,
  WorksheetSection,
  Worksheet,
} from './worksheet';

// Leveled Reading exports
export {
  ReadingPassageSchema,
  LeveledPassagesSchema,
  LeveledReadingSchema,
  validateLeveledReading,
  serializeLeveledReading,
  deserializeLeveledReading,
  LEXILE_LEVEL_RANGES,
} from './leveled-reading';

export type {
  ReadingPassage,
  LeveledPassages,
  LeveledReading,
} from './leveled-reading';

// Slide Outline exports
export {
  SlideTypeSchema,
  SlideSchema,
  SlideOutlineSchema,
  validateSlideOutline,
  serializeSlideOutline,
  deserializeSlideOutline,
  REQUIRED_SLIDE_TYPES,
  hasRequiredSlideTypes,
} from './slide-outline';

export type {
  SlideType,
  Slide,
  SlideOutline,
} from './slide-outline';

// Common validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: import('zod').ZodError['errors'];
}

// PDF Export utilities (Task 12.1)
export {
  exportLessonPlanToPDF,
  exportQuizToPDF,
  exportWorksheetToPDF,
  downloadLessonPlanPDF,
  downloadQuizPDF,
  downloadWorksheetPDF,
  downloadBlob,
} from './export-pdf';

// PPTX Export utilities (Task 12.2)
export {
  exportSlideOutlineToPPTX,
  downloadSlideOutlinePPTX,
} from './export-pptx';

// CSV Export utilities (Task 12.3)
export {
  exportQuizToCSV,
  exportQuizToLMSCSV,
  exportQuizAnswerKeyToCSV,
  csvToBlob,
  downloadQuizCSV,
  downloadQuizLMSCSV,
  downloadQuizAnswerKeyCSV,
} from './export-csv';
