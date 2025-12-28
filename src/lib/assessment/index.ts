// Rubric validation
export {
  RubricQuestionSchema,
  RubricSchema,
  validateRubric,
  type Rubric,
  type RubricQuestion,
  type ValidationResult,
} from './rubric';

// Grading result schema and validation
export {
  HandwritingQuality,
  StudentMetadataSchema,
  QuestionResultSchema,
  QuestionOverrideSchema,
  GradingResultSchema,
  parseGradingResult,
  serializeGradingResult,
  deserializeGradingResult,
  type StudentMetadata,
  type QuestionResult,
  type QuestionOverride,
  type GradingResult,
  type ParseResult,
} from './grading-result';

// File validation utilities
export {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  validateFileType,
  validateFileSize,
  validateFile,
  type AllowedMimeType,
  type FileTypeValidationResult,
  type FileSizeValidationResult,
  type FileValidationResult,
} from './file-validation';

// Storage path utilities
export {
  isValidUUID,
  sanitizeFilename,
  generateStoragePath,
  parseStoragePath,
  type StoragePathResult,
  type StoragePathOptions,
} from './storage-path';

// Access control utilities
export {
  canViewExam,
  canCreateExam,
  canUpdateExam,
  canDeleteExam,
  canViewSubmission,
  canCreateSubmission,
  canViewResult,
  filterAccessibleExams,
  filterAccessibleSubmissions,
  filterAccessibleResults,
  categorizeExamAccess,
  type UserContext,
  type ExamAccessContext,
  type SubmissionAccessContext,
  type ResultAccessContext,
} from './access-control';

// Annotation schema and validation
export {
  AnnotationType,
  TextLocationSchema,
  ImageLocationSchema,
  AnnotationLocationSchema,
  AnnotationSchema,
  validateAnnotation,
  isTextLocation,
  isImageLocation,
  type TextLocation,
  type ImageLocation,
  type AnnotationLocation,
  type Annotation,
  type AnnotationValidationResult,
} from './annotation';

// Override schema and calculation functions
export {
  CreateOverrideSchema,
  createOverride,
  calculateFinalScore,
  hasOverride,
  getOverride,
  getEffectiveScore,
  type CreateOverrideInput,
  type OverrideValidationResult,
} from './override';
