/**
 * Allowed MIME types for exam file uploads
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * File type validation result
 */
export interface FileTypeValidationResult {
  valid: boolean;
  mimeType?: AllowedMimeType;
  error?: string;
}

/**
 * File size validation result
 */
export interface FileSizeValidationResult {
  valid: boolean;
  sizeBytes: number;
  error?: string;
}

/**
 * Validates that a file has an allowed MIME type.
 * Accepts files with MIME types application/pdf, image/jpeg, or image/png.
 * Rejects all other MIME types.
 * 
 * @param mimeType - The MIME type to validate
 * @returns FileTypeValidationResult with valid status and either mimeType or error
 */
export function validateFileType(mimeType: string): FileTypeValidationResult {
  const normalizedType = mimeType.toLowerCase().trim();
  
  if (ALLOWED_MIME_TYPES.includes(normalizedType as AllowedMimeType)) {
    return {
      valid: true,
      mimeType: normalizedType as AllowedMimeType,
    };
  }
  
  return {
    valid: false,
    error: `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
  };
}

/**
 * Validates that a file size is within the allowed limit.
 * Accepts files with size ≤ 10MB and rejects files exceeding 10MB.
 * 
 * @param sizeBytes - The file size in bytes
 * @returns FileSizeValidationResult with valid status and size info or error
 */
export function validateFileSize(sizeBytes: number): FileSizeValidationResult {
  if (sizeBytes <= 0) {
    return {
      valid: false,
      sizeBytes,
      error: 'File size must be greater than 0 bytes',
    };
  }
  
  if (sizeBytes <= MAX_FILE_SIZE_BYTES) {
    return {
      valid: true,
      sizeBytes,
    };
  }
  
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
  const maxMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
  
  return {
    valid: false,
    sizeBytes,
    error: `File size (${sizeMB}MB) exceeds the ${maxMB}MB limit`,
  };
}

/**
 * Combined file validation result
 */
export interface FileValidationResult {
  valid: boolean;
  mimeType?: AllowedMimeType;
  sizeBytes?: number;
  errors: string[];
}

/**
 * Validates both file type and size in a single call.
 * 
 * @param mimeType - The MIME type to validate
 * @param sizeBytes - The file size in bytes
 * @returns FileValidationResult with combined validation results
 */
export function validateFile(mimeType: string, sizeBytes: number): FileValidationResult {
  const typeResult = validateFileType(mimeType);
  const sizeResult = validateFileSize(sizeBytes);
  
  const errors: string[] = [];
  if (!typeResult.valid && typeResult.error) {
    errors.push(typeResult.error);
  }
  if (!sizeResult.valid && sizeResult.error) {
    errors.push(sizeResult.error);
  }
  
  return {
    valid: typeResult.valid && sizeResult.valid,
    mimeType: typeResult.mimeType,
    sizeBytes: sizeResult.sizeBytes,
    errors,
  };
}
